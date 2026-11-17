import Decimal from 'decimal.js';
import { formatNumber, formatResult } from '../format';

describe('formatNumber', () => {
  test.each([
    ['1234567', '1,234,567'],
    ['12500.50', '12,500.50'],
    ['-1234', '-1,234'],
    ['0.', '0.'],
    ['999', '999'],
  ])('%s -> %s', (raw, expected) => {
    expect(formatNumber(raw)).toBe(expected);
  });
});

describe('formatResult', () => {
  test('hides floating point error', () => {
    expect(formatResult(new Decimal('0.1').plus('0.2'))).toBe('0.3');
  });
  test('rounds to 10 decimal places', () => {
    expect(formatResult(new Decimal(1).div(3))).toBe('0.3333333333');
  });
  test('strips trailing zeros', () => {
    expect(formatResult(new Decimal('400.00'))).toBe('400');
  });
  test('never uses exponent notation', () => {
    expect(formatResult(new Decimal('1e20'))).toBe('100,000,000,000,000,000,000');
  });
});
