import { CalcKey, displayText, expressionText, initialCalcState, press } from '../engine';
import vectors from '../test-vectors.json';

type Vector = { name: string; keys: string[]; expression: string; display: string };

describe('calculator engine (shared test vectors)', () => {
  test.each((vectors as Vector[]).map((v) => [v.name, v] as const))('%s', (_name, v) => {
    const state = v.keys.reduce((s, key) => press(s, key as CalcKey), initialCalcState);
    expect(expressionText(state)).toBe(v.expression);
    expect(displayText(state)).toBe(v.display);
  });
});
