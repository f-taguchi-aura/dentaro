import { Decimal } from 'decimal.js';
import { evaluate, Operator, Token } from './evaluate';
import { formatNumber, formatResult } from './format';

export type { Operator, Token } from './evaluate';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type CalcKey = Digit | '.' | Operator | '%' | '⌫' | 'AC' | '=';
export type CalcState = { tokens: Token[]; error: boolean; evaluated: boolean };

export const initialCalcState: CalcState = { tokens: [], error: false, evaluated: false };

const MAX_DIGITS = 15;
const ERROR_TEXT = 'エラー';
const OPERATORS: readonly string[] = ['+', '−', '×', '÷'];

function isDigit(key: CalcKey): key is Digit {
  return key.length === 1 && key >= '0' && key <= '9';
}

function isOperator(key: CalcKey): key is Operator {
  return OPERATORS.includes(key);
}

/** 丸め済みの結果をカンマなしの数値文字列にする（次の計算の先頭に使う）。 */
function resultRaw(d: Decimal): string {
  let s = d.toDecimalPlaces(10, Decimal.ROUND_HALF_UP).toFixed();
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
}

function withLast(tokens: Token[], last: Token): Token[] {
  return [...tokens.slice(0, -1), last];
}

function fresh(tokens: Token[]): CalcState {
  return { tokens, error: false, evaluated: false };
}

export function press(state: CalcState, key: CalcKey): CalcState {
  if (key === 'AC') return initialCalcState;

  if (state.error) {
    if (isDigit(key)) return fresh([{ kind: 'num', raw: key }]);
    if (key === '.') return fresh([{ kind: 'num', raw: '0.' }]);
    if (key === '⌫') return initialCalcState;
    return state;
  }

  if (state.evaluated) {
    if (isDigit(key)) return fresh([{ kind: 'num', raw: key }]);
    if (key === '.') return fresh([{ kind: 'num', raw: '0.' }]);
    if (key === '⌫') return initialCalcState;
    if (isOperator(key)) {
      const result = evaluate(state.tokens);
      if (result === null || result === 'div0') return state;
      return fresh([{ kind: 'num', raw: resultRaw(result) }, { kind: 'op', op: key }]);
    }
    return state; // '=' と '%' は何もしない
  }

  const { tokens } = state;
  const last = tokens[tokens.length - 1];

  if (isDigit(key)) {
    if (last?.kind === 'pct') return state;
    if (last?.kind === 'num') {
      if (last.raw === '0') return fresh(withLast(tokens, { kind: 'num', raw: key }));
      if (last.raw.replace(/[^0-9]/g, '').length >= MAX_DIGITS) return state;
      return fresh(withLast(tokens, { kind: 'num', raw: last.raw + key }));
    }
    return fresh([...tokens, { kind: 'num', raw: key }]);
  }

  if (key === '.') {
    if (last?.kind === 'pct') return state;
    if (last?.kind === 'num') {
      if (last.raw.includes('.')) return state;
      return fresh(withLast(tokens, { kind: 'num', raw: last.raw + '.' }));
    }
    return fresh([...tokens, { kind: 'num', raw: '0.' }]);
  }

  if (isOperator(key)) {
    if (!last) return fresh([{ kind: 'num', raw: '0' }, { kind: 'op', op: key }]);
    if (last.kind === 'op') return fresh(withLast(tokens, { kind: 'op', op: key }));
    return fresh([...tokens, { kind: 'op', op: key }]);
  }

  if (key === '%') {
    if (last?.kind !== 'num') return state;
    return fresh([...tokens, { kind: 'pct' }]);
  }

  if (key === '⌫') {
    if (!last) return state;
    if (last.kind === 'num') {
      const raw = last.raw.slice(0, -1);
      // "-3" から1文字消して "-" だけが残る場合は数値ごと消す
      if (raw !== '' && raw !== '-') return fresh(withLast(tokens, { kind: 'num', raw }));
    }
    return fresh(tokens.slice(0, -1));
  }

  // '='
  if (tokens.length === 0) return state;
  const result = evaluate(tokens);
  if (result === null) return state;
  return { tokens, error: result === 'div0', evaluated: true };
}

/** 入力中の式（例 "12,500 × 3.2%"）。 */
export function expressionText(state: CalcState): string {
  return state.tokens
    .map((t) => (t.kind === 'num' ? formatNumber(t.raw) : t.kind === 'op' ? ` ${t.op} ` : '%'))
    .join('')
    .trimEnd();
}

/** 大きく表示する数値。=後は結果、入力中は途中結果のプレビュー。 */
export function displayText(state: CalcState): string {
  if (state.error) return ERROR_TEXT;
  if (state.tokens.length === 0) return '0';
  const result = evaluate(state.tokens);
  if (result === 'div0' || result === null) {
    // 入力途中（例 "5 ÷ 0" のあと "5 ÷ 0.5" と続ける途中）はエラーを出さず、入力中の数値を見せる
    const lastNum = [...state.tokens].reverse().find((t) => t.kind === 'num');
    return lastNum && lastNum.kind === 'num' ? formatNumber(lastNum.raw) : '0';
  }
  return formatResult(result);
}
