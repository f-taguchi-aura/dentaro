import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalcKey, CalcState, displayText, expressionText } from '@/calc/engine';
import { Palette, usePalette } from '@/theme/tokens';

const ROWS: CalcKey[][] = [
  ['AC', '⌫', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const ACCENT_KEYS: readonly CalcKey[] = ['÷', '×', '−', '+', '='];
const FUNCTION_KEYS: readonly CalcKey[] = ['AC', '⌫', '%'];

type Props = {
  state: CalcState;
  onKey: (key: CalcKey) => void;
  active: boolean;
  /** 2画面のときは文字・キーを小さくする */
  compact: boolean;
};

export function CalculatorPane({ state, onKey, active, compact }: Props) {
  const p = usePalette();
  const gap = compact ? 6 : 10;

  return (
    <View style={[styles.pane, { backgroundColor: p.bg, padding: gap }]}>
      <View
        style={[
          styles.display,
          { backgroundColor: active && compact ? p.surface : 'transparent', paddingHorizontal: gap + 4 },
        ]}>
        <Text style={[styles.expression, { color: p.subtext, fontSize: compact ? 15 : 20 }]} numberOfLines={1}>
          {expressionText(state)}
        </Text>
        <Text
          style={[styles.result, { color: p.text, fontSize: compact ? 44 : 72 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.3}>
          {displayText(state)}
        </Text>
      </View>
      <View style={[styles.keypad, { gap }]}>
        {ROWS.map((row, i) => (
          <View key={i} style={[styles.row, { gap }]}>
            {row.map((key) => (
              <Key key={key} label={key} onPress={() => onKey(key)} palette={p} compact={compact} wide={key === '0'} />
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
  wide,
}: {
  label: CalcKey;
  onPress: () => void;
  palette: Palette;
  compact: boolean;
  wide: boolean;
}) {
  const accent = ACCENT_KEYS.includes(label);
  const fn = FUNCTION_KEYS.includes(label);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        { flex: wide ? 2 : 1, borderRadius: compact ? 14 : 22 },
        { backgroundColor: accent ? p.accent : pressed ? p.keyPressed : p.key },
        accent && pressed && styles.accentPressed,
      ]}>
      <Text
        style={[
          styles.keyLabel,
          { fontSize: compact ? 22 : 30, color: accent ? p.onAccent : fn ? p.subtext : p.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pane: { flex: 1 },
  display: { flex: 2, justifyContent: 'flex-end', alignItems: 'flex-end', borderRadius: 16, paddingBottom: 8 },
  expression: { fontWeight: '400', fontVariant: ['tabular-nums'] },
  result: { fontWeight: '300', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  keypad: { flex: 5 },
  row: { flex: 1, flexDirection: 'row' },
  key: { alignItems: 'center', justifyContent: 'center' },
  accentPressed: { opacity: 0.75 },
  keyLabel: { fontWeight: '400' },
});
