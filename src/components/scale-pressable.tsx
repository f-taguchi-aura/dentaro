import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Platform, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export type HapticKind = 'light' | 'medium' | 'selection' | 'none';

const SPRING = { damping: 18, stiffness: 420, mass: 0.6 };

export function haptic(kind: HapticKind) {
  if (Platform.OS === 'web' || kind === 'none') return;
  if (kind === 'selection') Haptics.selectionAsync().catch(() => {});
  else
    Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(
      () => {},
    );
}

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode | ((state: { pressed: boolean }) => ReactNode);
  haptics?: HapticKind;
  pressedScale?: number;
};

/** 押すと少し沈み、指を離すとバネで戻る。触感フィードバック付き。 */
export function ScalePressable({ style, children, haptics = 'light', pressedScale = 0.94, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  // flex は外側（並べ方）に、見た目は内側（拡大縮小する部分）に当てる
  const flex = StyleSheet.flatten(style)?.flex;
  return (
    <Pressable
      {...rest}
      style={flex !== undefined ? { flex } : undefined}
      onPressIn={(e) => {
        scale.set(withSpring(pressedScale, SPRING));
        haptic(haptics);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}>
      {(state) => <Animated.View style={[style, flex !== undefined && styles.fill, animated]}>{typeof children === 'function' ? children(state) : children}</Animated.View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
