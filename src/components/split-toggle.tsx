import { StyleSheet, View } from 'react-native';

import { CalcLayout } from '@/calc/layout';
import { ScalePressable } from '@/components/scale-pressable';
import { usePalette } from '@/theme/tokens';

/** 1画面 ⇔ 2画面 の切替ボタン（アイコンで分割状態を表す）。 */
export function SplitToggle({ layout, onChange }: { layout: CalcLayout; onChange: (l: CalcLayout) => void }) {
  const p = usePalette();
  const dual = layout === 'dual';
  const color = dual ? p.onAccent : p.subtext;
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={dual ? '1画面にする' : '2画面にする'}
      accessibilityState={{ selected: dual }}
      haptics="selection"
      onPress={() => onChange(dual ? 'single' : 'dual')}
      style={[
        styles.button,
        { backgroundColor: dual ? p.accent : p.elevated, borderColor: dual ? 'transparent' : p.hairline },
        dual && { shadowColor: p.glow, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      ]}>
      <View style={[styles.icon, { borderColor: color }]}>
        <View style={[styles.half, { borderColor: color, opacity: dual ? 1 : 0.35 }]} />
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 16, height: 20, borderRadius: 4, borderWidth: 1.6, justifyContent: 'center' },
  half: { borderTopWidth: 1.6 },
});
