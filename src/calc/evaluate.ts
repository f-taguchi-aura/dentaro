import { Decimal } from 'decimal.js';

export type Operator = '+' | '−' | '×' | '÷';
export type Token = { kind: 'num'; raw: string } | { kind: 'op'; op: Operator } | { kind: 'pct' };

/** 15桁×15桁でも丸めが起きない精度で計算する。 */
export const D = Decimal.clone({ precision: 64 });

function toDecimal(raw: string): Decimal {
  return new D(raw.endsWith('.') ? raw.slice(0, -1) || '0' : raw);
}

/**
 * トークン列を評価する。× ÷ を + − より先に計算する。
 * `%` は直前の数値に付く後置演算子で、直前の演算子が + / − のときは
 * 「その演算子より左の式の値 × n/100」、それ以外は n/100 になる。
 * 末尾の演算子は無視する。空なら null、0 除算なら 'div0'。
 */
export function evaluate(tokens: Token[]): Decimal | 'div0' | null {
  const ts = tokens.length > 0 && tokens[tokens.length - 1].kind === 'op' ? tokens.slice(0, -1) : tokens;
  if (ts.length === 0) return null;

  const values: Decimal[] = [];
  const ops: Operator[] = [];
  for (let i = 0; i < ts.length; i++) {
    const t = ts[i];
    if (t.kind === 'op') {
      ops.push(t.op);
      continue;
    }
    if (t.kind !== 'num') return null;
    let value = toDecimal(t.raw);
    if (ts[i + 1]?.kind === 'pct') {
      const prev = ts[i - 1];
      if (prev?.kind === 'op' && (prev.op === '+' || prev.op === '−')) {
        const left = evaluate(ts.slice(0, i - 1));
        if (left === 'div0') return 'div0';
        value = (left ?? new D(0)).times(value).div(100);
      } else {
        value = value.div(100);
      }
      i++;
    }
    values.push(value);
  }
  if (values.length !== ops.length + 1) return null;

  // × ÷ を先に畳み込む
  const sumValues: Decimal[] = [values[0]];
  const sumOps: Operator[] = [];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const rhs = values[i + 1];
    if (op === '×' || op === '÷') {
      const lhs = sumValues.pop() as Decimal;
      if (op === '÷' && rhs.isZero()) return 'div0';
      sumValues.push(op === '×' ? lhs.times(rhs) : lhs.div(rhs));
    } else {
      sumOps.push(op);
      sumValues.push(rhs);
    }
  }
  return sumOps.reduce(
    (acc, op, i) => (op === '+' ? acc.plus(sumValues[i + 1]) : acc.minus(sumValues[i + 1])),
    sumValues[0],
  );
}
