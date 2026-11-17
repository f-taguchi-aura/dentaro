import { View } from 'react-native';

import { usePalette } from '@/theme/tokens';

export default function CompareScreen() {
  const p = usePalette();
  return <View style={{ flex: 1, backgroundColor: p.bg }} />;
}
