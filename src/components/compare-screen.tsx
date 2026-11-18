import { View } from 'react-native';

import { newPriceItem, UnitPriceView } from '@/components/unit-price-view';
import { usePersistentState } from '@/storage/use-persistent-state';
import { PriceItem } from '@/unit-price/compare';

type CompareState = { items: PriceItem[]; unit: string };

const initialCompareState: CompareState = { items: [newPriceItem(), newPriceItem()], unit: 'ml' };

export function CompareScreen() {
  const [state, setState, loaded] = usePersistentState('dentaro.compare', initialCompareState);
  if (!loaded) return <View style={{ flex: 1 }} />;
  return <UnitPriceView items={state.items} unit={state.unit} onChange={(items, unit) => setState({ items, unit })} />;
}
