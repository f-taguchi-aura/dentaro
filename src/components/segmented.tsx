import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ScalePressable } from '@/components/scale-pressable';
import { usePalette } from '@/theme/tokens';

type Option<T extends string> = { value: T; label: string };

/** 選択中の背景がバネでスライドするセグメント切替。 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const p = usePalette();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width > 0 ? (width - 8) / options.length : 0;
  const indicator = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withSpring(index * segment, { damping: 20, stiffness: 260 }) }],
  }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: p.elevated, borderColor: p.hairline }]}>
      {segment > 0 && (
        <Animated.View style={[styles.indicator, { shadowColor: p.glow }, indicator]}>
          <LinearGradient colors={p.accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <ScalePressable
            key={o.value}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            haptics="selection"
            pressedScale={0.97}
            onPress={() => onChange(o.value)}
            style={styles.option}>
            <Text style={[styles.label, { color: selected ? p.onAccent : p.subtext }]}>{o.label}</Text>
          </ScalePressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, padding: 4 },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
    overflow: 'hidden',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  option: { paddingVertical: 9, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
});
