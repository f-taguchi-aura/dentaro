import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalcKey } from '@/calc/engine';
import { initialCalcScreenState, PaneId, pressOn, setLayout, visiblePanes } from '@/calc/layout';
import { CalculatorPane } from '@/components/calculator-pane';
import { CompareScreen } from '@/components/compare-screen';
import { Segmented } from '@/components/segmented';
import { SplitToggle } from '@/components/split-toggle';
import { usePersistentState } from '@/storage/use-persistent-state';
import { usePalette } from '@/theme/tokens';

type Screen = 'calc' | 'compare';

export default function HomeScreen() {
  const p = usePalette();
  const { width, height } = useWindowDimensions();
  const [screen, setScreen, screenLoaded] = usePersistentState<Screen>('dentaro.screen', 'calc');
  const [calc, setCalc, calcLoaded] = usePersistentState('dentaro.calcScreen', initialCalcScreenState);

  if (!screenLoaded || !calcLoaded) return <View style={[styles.fill, { backgroundColor: p.bg }]} />;

  const panes = visiblePanes(calc);
  const dual = panes.length === 2;
  const side = dual && width > height;

  return (
    <View style={[styles.fill, { backgroundColor: p.bg }]}>
      {/* 上部にうっすら差すバーガンディの環境光 */}
      <LinearGradient colors={[p.ambient, 'transparent']} style={styles.ambient} pointerEvents="none" />
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.fill}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={[styles.brandDot, { backgroundColor: p.accent }]} />
            <Text style={[styles.brandText, { color: p.text }]}>DENTARO</Text>
          </View>
          <Segmented
            options={[
              { value: 'calc', label: '電卓' },
              { value: 'compare', label: 'お得比較' },
            ]}
            value={screen}
            onChange={setScreen}
          />
          <View style={styles.trailing}>
            {screen === 'calc' && <SplitToggle layout={calc.layout} onChange={(l) => setCalc((s) => setLayout(s, l))} />}
          </View>
        </View>

        {screen === 'calc' ? (
          <Animated.View key="calc" entering={FadeIn.duration(180)} style={[styles.fill, { flexDirection: side ? 'row' : 'column' }]}>
            {panes.map((pane: PaneId, i) => (
              <View
                key={pane}
                style={[
                  styles.fill,
                  i > 0 && (side ? { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: p.hairline } : { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: p.hairline }),
                ]}>
                <CalculatorPane
                  state={calc[pane]}
                  onKey={(key: CalcKey) => setCalc((s) => pressOn(s, pane, key))}
                  active={calc.active === pane}
                  compact={dual}
                  tag={dual ? pane.toUpperCase() : undefined}
                />
              </View>
            ))}
          </Animated.View>
        ) : (
          <Animated.View key="compare" entering={FadeIn.duration(180)} style={styles.fill}>
            <CompareScreen />
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  ambient: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  brand: { width: 44, flexDirection: 'row', alignItems: 'center', gap: 5, overflow: 'visible' },
  brandDot: { width: 7, height: 7, borderRadius: 4 },
  brandText: { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, width: 90, position: 'absolute', left: 12 },
  trailing: { width: 44, alignItems: 'flex-end' },
});
