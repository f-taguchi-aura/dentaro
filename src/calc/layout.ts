import { CalcKey, CalcState, initialCalcState, press } from './engine';

export type PaneId = 'a' | 'b';
export type CalcLayout = 'single' | 'dual';
export type CalcScreenState = { layout: CalcLayout; a: CalcState; b: CalcState; active: PaneId };

export const initialCalcScreenState: CalcScreenState = {
  layout: 'single',
  a: initialCalcState,
  b: initialCalcState,
  active: 'a',
};

/**
 * 1画面⇔2画面を切り替える。どちらの電卓の内容も失わない。
 * 1画面→2画面では、計算中の電卓が上（左）＝ a に来るよう、必要なら a と b を入れ替える。
 */
export function setLayout(s: CalcScreenState, layout: CalcLayout): CalcScreenState {
  if (s.layout === layout) return s;
  if (layout === 'dual' && s.active === 'b') {
    return { layout, a: s.b, b: s.a, active: 'a' };
  }
  return { ...s, layout };
}

/** 指定した電卓にキーを送り、その電卓を「最後に触った電卓」にする。 */
export function pressOn(s: CalcScreenState, pane: PaneId, key: CalcKey): CalcScreenState {
  return { ...s, [pane]: press(s[pane], key), active: pane };
}

/** 表示する電卓。1画面なら最後に触った電卓だけ。 */
export function visiblePanes(s: CalcScreenState): PaneId[] {
  return s.layout === 'single' ? [s.active] : ['a', 'b'];
}
