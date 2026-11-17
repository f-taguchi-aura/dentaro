import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { newPriceItem, UnitPriceView } from '@/components/unit-price-view';
import { usePersistentState } from '@/storage/use-persistent-state';
import { usePalette } from '@/theme/tokens';
import { PriceItem } from '@/unit-price/compare';

type CompareState = { items: PriceItem[]; unit: string };

const initialCompareState: CompareState = { items: [newPriceItem(), newPriceItem()], unit: 'ml' };

export default function CompareScreen() {
  const p = usePalette();
  const [state, setState, loaded] = usePersistentState('dentaro.compare', initialCompareState);

  if (!loaded) return <View style={[styles.fill, { backgroundColor: p.bg }]} />;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fill, { backgroundColor: p.bg }]}>
      <UnitPriceView items={state.items} unit={state.unit} onChange={(items, unit) => setState({ items, unit })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
