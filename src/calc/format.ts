import { Decimal } from 'decimal.js';

/** 入力途中の数値文字列に3桁カンマを付ける（小数部・末尾の "." はそのまま）。 */
export function formatNumber(raw: string): string {
  const negative = raw.startsWith('-');
  const body = negative ? raw.slice(1) : raw;
  const dot = body.indexOf('.');
  const intPart = dot === -1 ? body : body.slice(0, dot);
  const rest = dot === -1 ? '' : body.slice(dot);
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (negative ? '-' : '') + grouped + rest;
}

/** 計算結果を小数点以下最大10桁に丸め、末尾の0を除いて整形する。 */
export function formatResult(d: Decimal): string {
  let s = d.toDecimalPlaces(10, Decimal.ROUND_HALF_UP).toFixed();
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  if (s === '-0') s = '0';
  return formatNumber(s);
}
