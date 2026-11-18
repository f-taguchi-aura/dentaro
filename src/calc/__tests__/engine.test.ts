import { CalcKey, displayText, expressionText, initialCalcState, pendingOperator, press } from '../engine';
import vectors from '../test-vectors.json';

type Vector = { name: string; keys: string[]; expression: string; display: string };

describe('calculator engine (shared test vectors)', () => {
  test.each((vectors as Vector[]).map((v) => [v.name, v] as const))('%s', (_name, v) => {
    const state = v.keys.reduce((s, key) => press(s, key as CalcKey), initialCalcState);
    expect(expressionText(state)).toBe(v.expression);
    expect(displayText(state)).toBe(v.display);
  });
});

describe('pendingOperator', () => {
  const run = (keys: string) => keys.split(' ').reduce((s, k) => press(s, k as CalcKey), initialCalcState);
  test('is the operator waiting for its right-hand number', () => {
    expect(pendingOperator(run('5 ×'))).toBe('×');
  });
  test('is null once a number follows', () => {
    expect(pendingOperator(run('5 × 2'))).toBeNull();
  });
  test('is null after evaluation', () => {
    expect(pendingOperator(run('5 × 2 ='))).toBeNull();
  });
});
