import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalcLayout } from '@/calc/layout';
import { usePalette } from '@/theme/tokens';

const OPTIONS: { value: CalcLayout; label: string }[] = [
  { value: 'single', label: '1画面' },
  { value: 'dual', label: '2画面' },
];

export function LayoutSwitch({ layout, onChange }: { layout: CalcLayout; onChange: (l: CalcLayout) => void }) {
  const p = usePalette();
  return (
    <View style={[styles.track, { backgroundColor: p.surface, borderColor: p.border }]}>
      {OPTIONS.map(({ value, label }) => {
        const selected = value === layout;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(value)}
            style={[styles.option, selected && { backgroundColor: p.accent }]}>
            <Text style={[styles.label, { color: selected ? p.onAccent : p.subtext }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, padding: 3, alignSelf: 'center' },
  option: { paddingVertical: 6, paddingHorizontal: 18, borderRadius: 999 },
  label: { fontSize: 14, fontWeight: '600' },
});
