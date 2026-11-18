import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ScalePressable } from '@/components/scale-pressable';
import { numericFont, Palette, usePalette } from '@/theme/tokens';
import { cheapestIds, formatPremium, formatUnitPrice, premiumOverCheapest, PriceItem, unitPrice } from '@/unit-price/compare';

export const MIN_ITEMS = 2;
export const MAX_ITEMS = 6;

export function newPriceItem(): PriceItem {
  return { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, name: '', price: '', quantity: '' };
}

type Props = {
  items: PriceItem[];
  unit: string;
  onChange: (items: PriceItem[], unit: string) => void;
};

export function UnitPriceView({ items, unit, onChange }: Props) {
  const p = usePalette();
  const best = cheapestIds(items);
  const premium = premiumOverCheapest(items);
  const update = (id: string, patch: Partial<PriceItem>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)), unit);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets>
      <View style={styles.unitRow}>
        <Text style={[styles.caption, { color: p.subtext }]}>単位</Text>
        <TextInput
          value={unit}
          onChangeText={(u) => onChange(items, u)}
          placeholder="ml"
          placeholderTextColor={p.faint}
          style={[styles.unitInput, { color: p.text, backgroundColor: p.elevated, borderColor: p.hairline }]}
          accessibilityLabel="単位"
        />
      </View>

      {items.map((item, i) => {
        const up = unitPrice(item);
        const isBest = best.includes(item.id) && items.filter((it) => unitPrice(it)).length >= 2;
        const extra = premium[item.id];
        return (
          <Animated.View key={item.id} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} layout={LinearTransition.springify().damping(18)}>
            <Card best={isBest} palette={p}>
              <View style={styles.cardHeader}>
                <Text style={[styles.index, numericFont, { color: isBest ? p.accent : p.faint }]}>{String(i + 1).padStart(2, '0')}</Text>
                <TextInput
                  value={item.name}
                  onChangeText={(name) => update(item.id, { name })}
                  placeholder={`商品 ${String.fromCharCode(65 + i)}`}
                  placeholderTextColor={p.faint}
                  style={[styles.name, { color: p.text }]}
                  accessibilityLabel={`${i + 1}件目の名前`}
                />
                {isBest && (
                  <View style={styles.badge}>
                    <LinearGradient colors={p.accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                    <Text style={[styles.badgeText, { color: p.onAccent }]}>★ BEST</Text>
                  </View>
                )}
                {items.length > MIN_ITEMS && (
                  <ScalePressable
                    accessibilityRole="button"
                    accessibilityLabel={`${i + 1}件目を削除`}
                    onPress={() => onChange(items.filter((it) => it.id !== item.id), unit)}
                    hitSlop={12}
                    style={[styles.remove, { borderColor: p.hairline }]}>
                    <Text style={[styles.removeText, { color: p.subtext }]}>✕</Text>
                  </ScalePressable>
                )}
              </View>

              <View style={styles.inputs}>
                <Field label="価格" prefix="¥" value={item.price} onChange={(price) => update(item.id, { price })} palette={p} a11y={`${i + 1}件目の価格`} />
                <Field label="容量" suffix={unit} value={item.quantity} onChange={(quantity) => update(item.id, { quantity })} palette={p} a11y={`${i + 1}件目の容量`} />
              </View>

              <View style={[styles.resultRow, { borderTopColor: p.hairline }]}>
                <Text style={[styles.caption, { color: p.subtext }]}>
                  {extra && !isBest && !extra.isZero() ? `+${formatPremium(extra)}% 割高` : isBest ? '最もお得' : '1単位あたり'}
                </Text>
                <Text style={[styles.unitPrice, numericFont, { color: isBest ? p.accent : up ? p.text : p.faint }]} numberOfLines={1} adjustsFontSizeToFit>
                  {up ? `¥${formatUnitPrice(up)}` : '—'}
                  {up && <Text style={[styles.perUnit, { color: p.subtext }]}>{` / ${unit || '単位'}`}</Text>}
                </Text>
              </View>
            </Card>
          </Animated.View>
        );
      })}

      {items.length < MAX_ITEMS && (
        <ScalePressable
          accessibilityRole="button"
          accessibilityLabel="＋ 追加"
          onPress={() => onChange([...items, newPriceItem()], unit)}
          pressedScale={0.98}
          style={[styles.add, { borderColor: p.faint }]}>
          <Text style={[styles.addLabel, { color: p.subtext }]}>＋ 比較する商品を追加</Text>
        </ScalePressable>
      )}
    </ScrollView>
  );
}

function Card({ best, palette: p, children }: { best: boolean; palette: Palette; children: React.ReactNode }) {
  if (!best) {
    return <View style={[styles.card, { backgroundColor: p.elevated, borderColor: p.hairline }]}>{children}</View>;
  }
  return (
    <View style={[styles.bestShadow, { shadowColor: p.glow }]}>
      <LinearGradient colors={p.accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bestBorder}>
        <View style={[styles.card, styles.cardInner, { backgroundColor: p.elevated }]}>{children}</View>
      </LinearGradient>
    </View>
  );
}

function Field({
  label,
  prefix,
  suffix,
  value,
  onChange,
  palette: p,
  a11y,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  a11y: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.caption, { color: p.subtext }]}>{label}</Text>
      <View style={[styles.fieldBox, { backgroundColor: p.bg, borderColor: p.hairline }]}>
        {prefix && <Text style={[styles.affix, { color: p.subtext }]}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={p.faint}
          style={[styles.fieldInput, numericFont, { color: p.text }]}
          accessibilityLabel={a11y}
        />
        {suffix ? <Text style={[styles.affix, { color: p.subtext }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 48, gap: 16 },
  unitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caption: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2 },
  unitInput: {
    width: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: { borderRadius: 26, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 16 },
  cardInner: { borderWidth: 0, borderRadius: 24.5 },
  bestBorder: { borderRadius: 26, padding: 1.5 },
  bestShadow: { borderRadius: 26, shadowOpacity: 1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  index: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  name: { flex: 1, minWidth: 0, fontSize: 20, fontWeight: '600', padding: 0 },
  badge: { borderRadius: 999, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  remove: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 13 },
  inputs: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 8 },
  fieldBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, height: 60 },
  affix: { fontSize: 18 },
  fieldInput: { flex: 1, fontSize: 26, fontWeight: '300', paddingHorizontal: 6, minWidth: 0 },
  resultRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14, gap: 12 },
  unitPrice: { fontSize: 40, fontWeight: '200', letterSpacing: -1, flexShrink: 1 },
  perUnit: { fontSize: 16, fontWeight: '400', letterSpacing: 0 },
  add: { borderRadius: 26, borderWidth: 1.2, borderStyle: 'dashed', paddingVertical: 22, alignItems: 'center' },
  addLabel: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
});
