import { Decimal } from 'decimal.js';
import { cheapestIds, formatPremium, formatUnitPrice, premiumOverCheapest, PriceItem, unitPrice } from '../compare';

const item = (id: string, price: string, quantity: string): PriceItem => ({ id, name: '', price, quantity });

describe('unitPrice', () => {
  test('divides price by quantity', () => {
    expect(unitPrice(item('A', '398', '500'))?.toString()).toBe('0.796');
  });
  test.each([
    ['zero quantity', '398', '0'],
    ['empty price', '', '500'],
    ['non-numeric price', 'abc', '500'],
    ['empty quantity', '398', ''],
    ['negative price', '-1', '500'],
  ])('%s -> null', (_label, price, quantity) => {
    expect(unitPrice(item('A', price, quantity))).toBeNull();
  });
});

describe('cheapestIds', () => {
  test('picks the lowest unit price', () => {
    expect(cheapestIds([item('A', '398', '500'), item('B', '680', '1000')])).toEqual(['B']);
  });
  test('returns all ties', () => {
    expect(cheapestIds([item('A', '100', '10'), item('B', '200', '20')])).toEqual(['A', 'B']);
  });
  test('ignores invalid rows', () => {
    expect(cheapestIds([item('A', '398', '500'), item('B', '680', '0')])).toEqual(['A']);
  });
  test('returns nothing when no row is valid', () => {
    expect(cheapestIds([item('A', '', ''), item('B', '680', '0')])).toEqual([]);
  });
});

describe('formatUnitPrice', () => {
  test('two decimal places', () => {
    expect(formatUnitPrice(new Decimal('0.796'))).toBe('0.80');
  });
  test('grouping', () => {
    expect(formatUnitPrice(new Decimal('1234.5'))).toBe('1,234.50');
  });
});

describe('premiumOverCheapest', () => {
  test('percent more expensive than the cheapest, per valid row', () => {
    const r = premiumOverCheapest([item('A', '398', '500'), item('B', '680', '1000'), item('C', '', '')]);
    expect(r.B?.toString()).toBe('0');
    expect(r.A?.toDecimalPlaces(2).toString()).toBe('17.06');
    expect(r.C).toBeUndefined();
  });
  test('formatPremium rounds to one decimal and drops .0', () => {
    expect(formatPremium(new Decimal('17.0588'))).toBe('17.1');
    expect(formatPremium(new Decimal('20'))).toBe('20');
  });
});
