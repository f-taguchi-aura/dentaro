import { Decimal } from 'decimal.js';
import { formatNumber } from '../calc/format';

export type PriceItem = { id: string; name: string; price: string; quantity: string };

function parsePositive(raw: string): Decimal | null {
  const s = raw.trim().replace(/,/g, '');
  if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return null;
  const d = new Decimal(s);
  return d.greaterThan(0) ? d : null;
}

/** 1単位あたりの価格。価格・容量が空・数値でない・0以下なら null。 */
export function unitPrice(item: PriceItem): Decimal | null {
  const price = parsePositive(item.price);
  const quantity = parsePositive(item.quantity);
  if (!price || !quantity) return null;
  return price.div(quantity);
}

/** 単価が最も安い行の id（同額はすべて）。有効な行がなければ空。 */
export function cheapestIds(items: PriceItem[]): string[] {
  const priced = items
    .map((item) => ({ id: item.id, unit: unitPrice(item) }))
    .filter((x): x is { id: string; unit: Decimal } => x.unit !== null);
  if (priced.length === 0) return [];
  const min = Decimal.min(...priced.map((x) => x.unit));
  return priced.filter((x) => x.unit.equals(min)).map((x) => x.id);
}

/** 小数点以下2桁固定＋3桁カンマ。 */
export function formatUnitPrice(d: Decimal): string {
  return formatNumber(d.toFixed(2, Decimal.ROUND_HALF_UP));
}

/** 最安に比べて何 % 高いか（有効な行のみ。最安は 0）。 */
export function premiumOverCheapest(items: PriceItem[]): Record<string, Decimal> {
  const priced = items
    .map((item) => ({ id: item.id, unit: unitPrice(item) }))
    .filter((x): x is { id: string; unit: Decimal } => x.unit !== null);
  if (priced.length === 0) return {};
  const min = Decimal.min(...priced.map((x) => x.unit));
  return Object.fromEntries(priced.map((x) => [x.id, x.unit.div(min).minus(1).times(100)]));
}

/** 小数1桁に丸め、".0" は省く。 */
export function formatPremium(d: Decimal): string {
  return formatNumber(d.toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toString());
}
