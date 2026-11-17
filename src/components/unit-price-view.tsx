import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { cheapestIds, formatUnitPrice, PriceItem, unitPrice } from '@/unit-price/compare';
import { Palette, usePalette } from '@/theme/tokens';

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
  const update = (id: string, patch: Partial<PriceItem>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)), unit);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <View style={styles.unitRow}>
        <Text style={[styles.unitLabel, { color: p.subtext }]}>単位</Text>
        <TextInput
          value={unit}
          onChangeText={(u) => onChange(items, u)}
          placeholder="ml"
          placeholderTextColor={p.subtext}
          style={[styles.unitInput, { color: p.text, backgroundColor: p.surface }]}
          accessibilityLabel="単位"
        />
      </View>

      {items.map((item, i) => {
        const up = unitPrice(item);
        const isBest = best.includes(item.id);
        return (
          <View
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: p.surface, borderColor: isBest ? p.accent : p.border },
              isBest && styles.cardBest,
            ]}>
            <View style={styles.cardHeader}>
              <TextInput
                value={item.name}
                onChangeText={(name) => update(item.id, { name })}
                placeholder={String.fromCharCode(65 + i)}
                placeholderTextColor={p.subtext}
                style={[styles.name, { color: p.text }]}
                accessibilityLabel={`${i + 1}件目の名前`}
              />
              {isBest && <Text style={[styles.star, { color: p.accent }]}>★ お得</Text>}
              {items.length > MIN_ITEMS && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1}件目を削除`}
                  onPress={() => onChange(items.filter((it) => it.id !== item.id), unit)}
                  hitSlop={10}>
                  <Text style={[styles.remove, { color: p.subtext }]}>✕</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.inputs}>
              <Field
                label="価格"
                prefix="¥"
                value={item.price}
                onChange={(price) => update(item.id, { price })}
                palette={p}
                a11y={`${i + 1}件目の価格`}
              />
              <Field
                label="容量"
                suffix={unit}
                value={item.quantity}
                onChange={(quantity) => update(item.id, { quantity })}
                palette={p}
                a11y={`${i + 1}件目の容量`}
              />
            </View>
            <Text style={[styles.unitPrice, { color: isBest ? p.accent : up ? p.text : p.subtext }]}>
              {up ? `¥${formatUnitPrice(up)} / ${unit || '単位'}` : '—'}
            </Text>
          </View>
        );
      })}

      {items.length < MAX_ITEMS && (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange([...items, newPriceItem()], unit)}
          style={({ pressed }) => [styles.add, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.addLabel, { color: p.subtext }]}>＋ 追加</Text>
        </Pressable>
      )}
    </ScrollView>
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
      <Text style={[styles.fieldLabel, { color: p.subtext }]}>{label}</Text>
      <View style={[styles.fieldBox, { backgroundColor: p.bg, borderColor: p.border }]}>
        {prefix && <Text style={[styles.affix, { color: p.subtext }]}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={p.subtext}
          style={[styles.fieldInput, { color: p.text }]}
          accessibilityLabel={a11y}
        />
        {suffix ? <Text style={[styles.affix, { color: p.subtext }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unitLabel: { fontSize: 14 },
  unitInput: { minWidth: 80, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, fontSize: 16 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
  cardBest: { borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', padding: 0 },
  star: { fontSize: 14, fontWeight: '700' },
  remove: { fontSize: 16 },
  inputs: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 12 },
  fieldBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10 },
  affix: { fontSize: 15 },
  fieldInput: { flex: 1, fontSize: 18, paddingVertical: 8, paddingHorizontal: 4, fontVariant: ['tabular-nums'] },
  unitPrice: { fontSize: 22, fontWeight: '300', textAlign: 'right', fontVariant: ['tabular-nums'] },
  add: { borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center' },
  addLabel: { fontSize: 15, fontWeight: '600' },
});
