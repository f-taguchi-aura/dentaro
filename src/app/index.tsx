import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalcKey } from '@/calc/engine';
import { initialCalcScreenState, PaneId, pressOn, setLayout, visiblePanes } from '@/calc/layout';
import { CalculatorPane } from '@/components/calculator-pane';
import { LayoutSwitch } from '@/components/layout-switch';
import { usePersistentState } from '@/storage/use-persistent-state';
import { usePalette } from '@/theme/tokens';

export default function CalculatorScreen() {
  const p = usePalette();
  const { width, height } = useWindowDimensions();
  const [state, setState, loaded] = usePersistentState('dentaro.calcScreen', initialCalcScreenState);

  if (!loaded) return <View style={[styles.fill, { backgroundColor: p.bg }]} />;

  const panes = visiblePanes(state);
  const dual = panes.length === 2;
  const side = dual && width > height;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fill, { backgroundColor: p.bg }]}>
      <View style={styles.header}>
        <LayoutSwitch layout={state.layout} onChange={(l) => setState((s) => setLayout(s, l))} />
      </View>
      <View style={[styles.fill, { flexDirection: side ? 'row' : 'column' }]}>
        {panes.map((pane: PaneId, i) => (
          <View
            key={pane}
            style={[
              styles.fill,
              i > 0 && (side ? { borderLeftWidth: 1, borderLeftColor: p.border } : { borderTopWidth: 1, borderTopColor: p.border }),
            ]}>
            <CalculatorPane
              state={state[pane]}
              onKey={(key: CalcKey) => setState((s) => pressOn(s, pane, key))}
              active={state.active === pane}
              compact={dual}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingVertical: 8 },
});
