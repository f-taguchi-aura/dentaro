import { CalcKey, expressionText } from '../engine';
import { CalcScreenState, initialCalcScreenState, PaneId, pressOn, setLayout, visiblePanes } from '../layout';

const typeOn = (s: CalcScreenState, pane: PaneId, keys: string) =>
  keys.split(' ').reduce((acc, k) => pressOn(acc, pane, k as CalcKey), s);

describe('single/dual layout switching', () => {
  test('starts in single layout showing pane a', () => {
    expect(initialCalcScreenState.layout).toBe('single');
    expect(visiblePanes(initialCalcScreenState)).toEqual(['a']);
  });

  test('going dual keeps the in-progress calculation on top, other pane empty', () => {
    const s = setLayout(typeOn(initialCalcScreenState, 'a', '1 + 2'), 'dual');
    expect(visiblePanes(s)).toEqual(['a', 'b']);
    expect(expressionText(s.a)).toBe('1 + 2');
    expect(expressionText(s.b)).toBe('');
  });

  test('going single keeps the last touched pane', () => {
    let s = setLayout(typeOn(initialCalcScreenState, 'a', '1 + 2'), 'dual');
    s = typeOn(s, 'b', '5');
    s = setLayout(s, 'single');
    expect(visiblePanes(s)).toEqual(['b']);
    expect(expressionText(s.b)).toBe('5');
  });

  test('going dual again puts the active calculation on top and keeps the other', () => {
    let s = setLayout(typeOn(initialCalcScreenState, 'a', '1 + 2'), 'dual');
    s = setLayout(typeOn(s, 'b', '5'), 'single');
    s = setLayout(s, 'dual');
    expect(s.active).toBe('a');
    expect(expressionText(s.a)).toBe('5');
    expect(expressionText(s.b)).toBe('1 + 2');
  });

  test('pressing on one pane does not affect the other', () => {
    let s = setLayout(initialCalcScreenState, 'dual');
    s = typeOn(s, 'a', '9 ×');
    s = typeOn(s, 'b', '1 =');
    expect(expressionText(s.a)).toBe('9 ×');
    expect(expressionText(s.b)).toBe('1');
  });

  test('setting the same layout is a no-op', () => {
    const s = typeOn(initialCalcScreenState, 'a', '7');
    expect(setLayout(s, 'single')).toBe(s);
  });
});
