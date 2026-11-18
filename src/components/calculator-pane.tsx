import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CalcKey, CalcState, displayText, expressionText, pendingOperator } from '@/calc/engine';
import { HapticKind, ScalePressable } from '@/components/scale-pressable';
import { numericFont, Palette, usePalette } from '@/theme/tokens';

const ROWS: CalcKey[][] = [
  ['AC', '⌫', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const OPERATOR_KEYS: readonly CalcKey[] = ['÷', '×', '−', '+'];
const FUNCTION_KEYS: readonly CalcKey[] = ['AC', '⌫', '%'];

type Props = {
  state: CalcState;
  onKey: (key: CalcKey) => void;
  active: boolean;
  /** 2画面のときは文字・キーを小さくする */
  compact: boolean;
  /** 2画面時に表示する識別ラベル（A / B） */
  tag?: string;
};

export function CalculatorPane({ state, onKey, active, compact, tag }: Props) {
  const p = usePalette();
  const gap = compact ? 7 : 12;
  const pending = pendingOperator(state);
  const resultIsFinal = state.evaluated || state.error;

  return (
    <View style={[styles.pane, { padding: gap, paddingTop: compact ? 4 : 8 }]}>
      <View style={[styles.display, { paddingHorizontal: gap + 6 }]}>
        {tag && (
          <View style={styles.tagRow}>
            <View style={[styles.tagDot, { backgroundColor: active ? p.accent : p.faint }]} />
            <Text style={[styles.tag, { color: active ? p.text : p.faint }]}>{tag}</Text>
          </View>
        )}
        <Text style={[styles.expression, numericFont, { color: p.subtext, fontSize: compact ? 15 : 19 }]} numberOfLines={1}>
          {expressionText(state) || ' '}
        </Text>
        <Animated.Text
          key={resultIsFinal ? 'final' : 'live'}
          entering={FadeIn.duration(160)}
          style={[
            styles.result,
            numericFont,
            { color: resultIsFinal || !pending ? p.text : p.subtext, fontSize: compact ? 50 : 84 },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.3}>
          {displayText(state)}
        </Animated.Text>
      </View>
      <View style={[styles.keypad, { gap }]}>
        {ROWS.map((row, i) => (
          <View key={i} style={[styles.row, { gap }]}>
            {row.map((key) => (
              <Key key={key} label={key} onPress={() => onKey(key)} palette={p} compact={compact} pending={pending === key} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function Key({
  label,
  onPress,
  palette: p,
  compact,
  pending,
}: {
  label: CalcKey;
  onPress: () => void;
  palette: Palette;
  compact: boolean;
  pending: boolean;
}) {
  const isOperator = OPERATOR_KEYS.includes(label);
  const isEquals = label === '=';
  const isFunction = FUNCTION_KEYS.includes(label);
  const radius = compact ? 16 : 26;
  const haptics: HapticKind = isEquals ? 'medium' : 'light';
  const fontSize = compact ? 22 : 32;

  const accentFill = (isOperator && !pending) || isEquals;

  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptics={haptics}
      style={[
        styles.key,
        {
          flex: label === '0' ? 2 : 1,
          borderRadius: radius,
          borderCurve: 'continuous',
          backgroundColor: pending ? p.text : isFunction ? 'transparent' : p.key,
          borderColor: isFunction ? p.hairline : 'transparent',
          borderWidth: isFunction ? 1 : 0,
        },
        accentFill && { shadowColor: p.glow, shadowOpacity: 1, shadowRadius: isEquals ? 14 : 8, shadowOffset: { width: 0, height: 4 } },
        !accentFill && !isFunction && !pending && p.scheme === 'light' && styles.lightShadow,
      ]}>
      {accentFill && (
        <LinearGradient
          colors={p.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      )}
      <Text
        style={[
          styles.keyLabel,
          {
            fontSize: isOperator || isEquals ? fontSize + 4 : fontSize,
            fontWeight: isOperator || isEquals ? '400' : '300',
            color: pending ? p.accent : accentFill ? p.onAccent : isFunction ? p.subtext : p.text,
          },
        ]}>
        {label}
      </Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  pane: { flex: 1 },
  display: { flex: 2, justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: 6 },
  tagRow: { position: 'absolute', top: 6, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tag: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  expression: { fontWeight: '400', letterSpacing: 0.5, marginBottom: 2 },
  result: { fontWeight: '200', letterSpacing: -1.5 },
  keypad: { flex: 5 },
  row: { flex: 1, flexDirection: 'row' },
  key: { alignItems: 'center', justifyContent: 'center' },
  keyLabel: { letterSpacing: 0 },
  lightShadow: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
});
