# Montaro 電卓 v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2分割の独立電卓＋単価比較モードを持つ iOS/Android アプリ本体を作る。

**Architecture:** 計算ロジックは UI 非依存の純粋関数（`press(state, key) → state`）。期待値は言語非依存の JSON テストベクタに置き、将来の Swift ウィジェットでも再利用する。画面は Expo Router の単一画面で、モード切替と2ペイン（縦=上下 / 横=左右）を持ち、状態は AsyncStorage に保存して復元する。

**Tech Stack:** Expo SDK 58 / Expo Router / TypeScript / decimal.js / @react-native-async-storage/async-storage / jest-expo

**Spec:** `docs/superpowers/specs/2026-11-16-split-calculator-design.md`

## Global Constraints

- パッケージ追加は必ず `npx expo install <pkg>`。Expo Go で動かないネイティブモジュールは追加しない。
- Bundle ID / パッケージ名は `jp.montaro.app`（変更しない）。
- `src/app/` には画面・レイアウトのみ。ロジックとコンポーネントは `src/` の他ディレクトリ。
- 完了条件：`npm test` / `npm run typecheck` / `npm run lint`（オフライン環境では `EXPO_OFFLINE=1`）がすべて通る。
- 色：白・黒・グレー＋アクセント1色（演算子キーと最安表示のみ）。ライト/ダーク両対応。
- 浮動小数点誤差を表示してはならない（数値計算はすべて decimal.js）。

## Review Focus

1. **巨大な数・長い入力**：入力は数字15桁で打ち止め、結果が長いときは表示が縮小され画面からはみ出さない → Task 2 のベクタ `digit-cap`、Task 5 の `adjustsFontSizeToFit`。
2. **0 除算**：`5 ÷ 0 =` は「エラー」表示、次の数字キーで新しい計算が始まる → Task 2 ベクタ `div-zero`。
3. **不正な順序の入力**：最初に演算子、演算子の連打、`=` の連打、`.` の重複 → Task 2 ベクタ `op-first` `op-replace` `equals-twice` `double-dot`。
4. **横向き**：`app.json` の `orientation` が `portrait` だと横分割が使えない → Task 5 で `default` に変更。
5. **単価比較の空欄・0**：価格や容量が空または 0 の行は単価を出さず ★ 対象外。全行が無効なら ★ なし。同額は全部 ★ → Task 3 のテスト。

---

## File Structure

| File | 責務 |
|---|---|
| `src/calc/format.ts` | 数値文字列のカンマ整形・結果の丸め |
| `src/calc/evaluate.ts` | トークン列の評価（優先順位・%） |
| `src/calc/engine.ts` | キー入力の状態遷移、表示用テキスト |
| `src/calc/test-vectors.json` | 言語非依存の期待値（Swift でも再利用） |
| `src/calc/__tests__/*.test.ts` | 上記のテスト |
| `src/unit-price/compare.ts` (+ test) | 単価計算と最安判定 |
| `src/storage/use-persistent-state.ts` (+ test) | AsyncStorage 永続化フック |
| `src/theme/tokens.ts` | 配色トークン（light/dark） |
| `src/components/calculator-pane.tsx` | 1台分の電卓（表示＋キーパッド） |
| `src/components/mode-switch.tsx` | 「電卓×2 / 単価比較」切替 |
| `src/components/unit-price-view.tsx` | 単価比較画面 |
| `src/app/index.tsx` | 画面組み立て・分割レイアウト・永続化 |

---

### Task 1: テスト基盤と数値整形

**Files:**
- Modify: `package.json`（`"test": "jest"`、`"jest": { "preset": "jest-expo" }`）
- Create: `src/calc/format.ts`, `src/calc/__tests__/format.test.ts`
- Modify: `.github/workflows/ci.yml`（`npm test` ステップ追加）

**Interfaces:**
- Produces: `formatNumber(raw: string): string` — 入力途中の数値文字列に3桁カンマ（`"12500.50"`→`"12,500.50"`、`"-1234"`→`"-1,234"`、`"0."`→`"0."`）。
- Produces: `formatResult(d: Decimal): string` — 小数点以下最大10桁に丸め（ROUND_HALF_UP）、末尾の0と不要な`.`を除去し、`formatNumber` を適用。指数表記にしない（`toFixed` 使用）。

- [ ] **Step 1:** `npx expo install jest-expo jest @types/jest decimal.js` と package.json 設定。
- [ ] **Step 2: Write the failing test** `format.test.ts`:
  - `formatNumber("1234567")` → `"1,234,567"`; `("12500.50")` → `"12,500.50"`; `("-1234")` → `"-1,234"`; `("0.")` → `"0."`; `("999")` → `"999"`
  - `formatResult(new Decimal("0.1").plus("0.2"))` → `"0.3"`; `(new Decimal(1).div(3))` → `"0.3333333333"`; `(new Decimal("400.00"))` → `"400"`; `(new Decimal("1e20"))` → `"100,000,000,000,000,000,000"`
- [ ] **Step 3:** `npm test -- format` → FAIL（モジュールなし）
- [ ] **Step 4:** 実装。
- [ ] **Step 5:** `npm test -- format` → PASS
- [ ] **Step 6:** CI に `- run: npm test` を typecheck の前に追加。Commit `feat: add number formatting and test setup`

### Task 2: 計算エンジン＋テストベクタ

**Files:**
- Create: `src/calc/evaluate.ts`, `src/calc/engine.ts`, `src/calc/test-vectors.json`, `src/calc/__tests__/engine.test.ts`

**Interfaces:**
- Consumes: `formatNumber`, `formatResult`（Task 1）
- Produces:
  ```ts
  export type Operator = '+' | '−' | '×' | '÷';
  export type CalcKey = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'.'|Operator|'%'|'⌫'|'AC'|'=';
  export type Token = { kind: 'num'; raw: string } | { kind: 'op'; op: Operator } | { kind: 'pct' };
  export type CalcState = { tokens: Token[]; error: boolean; evaluated: boolean };
  export const initialCalcState: CalcState;
  export function press(state: CalcState, key: CalcKey): CalcState;
  export function expressionText(state: CalcState): string; // 例 "12,500 × 3.2%"（演算子の前後に半角スペース）
  export function displayText(state: CalcState): string;    // 大きく出す数値。下記ルール
  // evaluate.ts
  export function evaluate(tokens: Token[]): Decimal | 'div0' | null; // null = 評価不能（空・末尾が演算子は末尾演算子を無視して評価）
  ```
- `displayText`：error 時 `"エラー"`。evaluated 時は結果。それ以外は評価可能なら途中結果プレビュー、空なら `"0"`。

**仕様（ベクタで固定する）:**
- 優先順位：× ÷ が + − より先。
- `%` は直前の数値に付く後置演算子。直前の演算子が + / − なら `n% = (その演算子より左の式の値) × n/100`、それ以外（×÷・先頭）なら `n/100`。
- `=` 後に数字キー → 新しい計算。`=` 後に演算子 → 結果を先頭数値として続行。`=` の連打は変化なし。
- 先頭で演算子 → `0` を補う（`−` も同様。符号入力は v1 では非対応）。演算子の連打は最後の演算子に置換。
- `.` で始めると `0.`。1つの数値内で `.` は1回のみ。数値は数字15桁まで（以降無視）。
- `⌫` は最後の1文字（または演算子・%）を削除。evaluated / error 時の `⌫` は `AC` と同じ。
- 0 除算は `=` で error。error 中は数字キーで新規開始、演算子は無視。

- [ ] **Step 1: Write `test-vectors.json`**（`[{ "name", "keys": string[], "expression", "display" }]`）。最低限以下を含める:
  | name | keys | expression | display |
  |---|---|---|---|
  | add | 1 + 2 = | `1 + 2` | `3` |
  | precedence | 1 + 2 × 3 = | `1 + 2 × 3` | `7` |
  | float | . 1 + . 2 = | `0.1 + 0.2` | `0.3` |
  | pct-mul | 1 2 5 0 0 × 3 . 2 % = | `12,500 × 3.2%` | `400` |
  | pct-add | 1 0 0 0 + 1 0 % = | `1,000 + 10%` | `1,100` |
  | pct-sub | 2 0 0 − 2 5 % = | `200 − 25%` | `150` |
  | pct-alone | 5 0 % = | `50%` | `0.5` |
  | div-third | 1 ÷ 3 = | `1 ÷ 3` | `0.3333333333` |
  | div-zero | 5 ÷ 0 = | `5 ÷ 0` | `エラー` |
  | div-zero-recover | 5 ÷ 0 = 7 | `7` | `7` |
  | op-first | × 5 = | `0 × 5` | `0` |
  | op-replace | 5 + × 2 = | `5 × 2` | `10` |
  | equals-twice | 2 + 3 = = | `2 + 3` | `5` |
  | continue-after-eq | 2 + 3 = × 4 = | `5 × 4` | `20` |
  | new-after-eq | 2 + 3 = 9 | `9` | `9` |
  | double-dot | 1 . . 5 | `1.5` | `1.5` |
  | digit-cap | 1×16回 | `111,111,111,111,111` | `111,111,111,111,111` |
  | backspace | 1 2 + ⌫ ⌫ | `1` | `1` |
  | preview | 1 2 + 3 | `12 + 3` | `15` |
  | trailing-op | 1 2 + | `12 +` | `12` |
  | clear | 1 + 2 AC | `` | `0` |
  | grouping | 1 2 3 4 5 6 7 | `1,234,567` | `1,234,567` |
- [ ] **Step 2:** `engine.test.ts` はベクタを `test.each` で回し、`keys` を `press` で畳み込んで `expressionText` と `displayText` を検証。
- [ ] **Step 3:** `npm test -- engine` → FAIL
- [ ] **Step 4:** `evaluate.ts` 実装（トークン列を2パスで評価：まず % を値に解決、次に × ÷、最後に + −。% の「左の式の値」は、その % が付く数値の直前の + / − より左のトークン列を `evaluate` した値）。
- [ ] **Step 5:** `engine.ts` 実装。
- [ ] **Step 6:** `npm test` → 全 PASS。Commit `feat: add calculator engine with shared test vectors`

### Task 3: 単価比較ロジック

**Files:**
- Create: `src/unit-price/compare.ts`, `src/unit-price/__tests__/compare.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type PriceItem = { id: string; name: string; price: string; quantity: string };
  export function unitPrice(item: PriceItem): Decimal | null;        // price/quantity。空・非数・0以下は null
  export function cheapestIds(items: PriceItem[]): string[];          // 有効な行のうち最小単価の id 全部。有効行が無ければ []
  export function formatUnitPrice(d: Decimal): string;                // 小数点以下2桁固定＋カンマ（"0.80", "1,234.50"）
  ```
- [ ] **Step 1: tests**：`unitPrice({price:"398",quantity:"500"})` → `0.796`; `quantity:"0"` → null; `price:""` → null; `price:"abc"` → null; `cheapestIds` で A=398/500, B=680/1000 → `["B"]`; 同単価2件 → 両方; 全行無効 → `[]`; `formatUnitPrice(new Decimal("0.796"))` → `"0.80"`
- [ ] **Step 2:** FAIL 確認 → **Step 3:** 実装 → **Step 4:** PASS → **Step 5:** Commit `feat: add unit price comparison logic`

### Task 4: 永続化フック

**Files:**
- Create: `src/storage/use-persistent-state.ts`, `src/storage/__tests__/use-persistent-state.test.tsx`

**Interfaces:**
- Produces: `usePersistentState<T>(key: string, initial: T): [value: T, setValue: (next: T) => void, loaded: boolean]` — 起動時に AsyncStorage から JSON を読み、壊れていれば `initial`。保存は 300ms デバウンス。
- キー名（Task 6 で使用）：`montaro.mode`, `montaro.calc.top`, `montaro.calc.bottom`, `montaro.unitPrice`

- [ ] **Step 1:** `npx expo install @react-native-async-storage/async-storage`。テストは公式 jest モック（`@react-native-async-storage/async-storage/jest/async-storage-mock`）と `@testing-library/react-native`（`npx expo install @testing-library/react-native`）。
- [ ] **Step 2: tests**：保存値があれば復元され `loaded` が true; 壊れた JSON → initial; `setValue` 後（fake timers で 300ms 進める）に `setItem` が呼ばれる。
- [ ] **Step 3:** FAIL → **Step 4:** 実装 → **Step 5:** PASS → **Step 6:** Commit `feat: add persistent state hook`

### Task 5: 配色トークンと電卓ペイン・2分割画面

**Files:**
- Create: `src/theme/tokens.ts`, `src/components/calculator-pane.tsx`
- Modify: `src/app/index.tsx`, `src/app/_layout.tsx`（ヘッダー非表示 `headerShown: false`、SafeArea）, `app.json`（`"orientation": "default"`）

**Interfaces:**
- Consumes: `CalcState`, `CalcKey`, `press`, `expressionText`, `displayText`（Task 2）
- Produces:
  ```ts
  export type Palette = { bg: string; surface: string; key: string; keyPressed: string; text: string; subtext: string; border: string; accent: string; onAccent: string };
  export function usePalette(): Palette; // useColorScheme で light/dark
  export function CalculatorPane(props: { state: CalcState; onKey: (k: CalcKey) => void; active: boolean; onFocus: () => void }): JSX.Element;
  ```
- 配色（Claude の判断、調整可）：light `bg #FFFFFF, surface #F4F4F5, key #E9E9EB, text #0A0A0A, subtext #71717A, border #E4E4E7`／dark `bg #000000, surface #111113, key #1F1F22, text #FAFAFA, subtext #A1A1AA, border #27272A`／accent 共通 `#FF6A00`、onAccent `#FFFFFF`。
- キー配置（4列×5行）：`AC ⌫ % ÷` / `7 8 9 ×` / `4 5 6 −` / `1 2 3 +` / `0(2列) . =`。演算子と `=` は accent。
- 表示部：上に `expressionText`（subtext・小）、下に `displayText`（text・大・細字、`numberOfLines={1}` + `adjustsFontSizeToFit`）。
- `index.tsx`：`useWindowDimensions` で `width > height` なら `flexDirection: 'row'`。ペイン間は 1px の border 線。タップされたペインを active にし表示部の背景を `surface` に。v1 のこのタスクでは状態は `useState`（永続化は Task 6）。

- [ ] **Step 1:** 実装。
- [ ] **Step 2: 検証**：`npm run typecheck` / lint PASS。`npx expo start --web` を起動し Playwright で 390×844 と 844×390 のスクショを撮り、上下・左右に2台並ぶこと、上で `1 + 2 =` を押して下が `0` のままであることを確認。
- [ ] **Step 3:** Commit `feat: add split-screen calculator UI`

### Task 6: モード切替・単価比較画面・永続化の接続

**Files:**
- Create: `src/components/mode-switch.tsx`, `src/components/unit-price-view.tsx`
- Modify: `src/app/index.tsx`

**Interfaces:**
- Consumes: Task 3 の `PriceItem` / `unitPrice` / `cheapestIds` / `formatUnitPrice`、Task 4 の `usePersistentState`、Task 5 のコンポーネント
- Produces:
  ```ts
  export type Mode = 'calc' | 'unit';
  export function ModeSwitch(props: { mode: Mode; onChange: (m: Mode) => void }): JSX.Element; // ラベル「電卓×2」「単価比較」のセグメント
  export function UnitPriceView(props: { items: PriceItem[]; unit: string; onChange: (items: PriceItem[], unit: string) => void }): JSX.Element;
  ```
- 単価比較 UI：上部に単位ラベル入力（初期 `"ml"`）。各行に 名前（任意・プレースホルダ A/B/C…）・価格・容量（`keyboardType="decimal-pad"`）、下に「¥0.80 / ml」。最安行は accent の ★ と枠線。初期2行、「＋ 追加」で最大6行、各行に削除（2行未満にはできない）。
- 永続化：`montaro.mode`(Mode) / `montaro.calc.top` / `montaro.calc.bottom`(CalcState) / `montaro.unitPrice`(`{items, unit}`)。全て `loaded` になるまでは空画面（背景色のみ）。

- [ ] **Step 1:** 実装。
- [ ] **Step 2: 検証**：typecheck / lint / test PASS。web で モード切替・単価比較（398/500 と 680/1000 → 下の行に ★、容量を 0 にすると ★ が上へ移る）をスクショ確認。リロード後に両電卓の式とモードが復元されること。
- [ ] **Step 3:** Commit `feat: add unit price mode and persistence`

### Task 7: 最終確認

- [ ] **Step 1:** `npm test && npm run typecheck && EXPO_OFFLINE=1 npm run lint` → 全 PASS
- [ ] **Step 2:** `EXPO_OFFLINE=1 npx expo export --platform ios --platform android` が成功（ネイティブバンドル生成確認）
- [ ] **Step 3:** README の「構成」に `src/calc`（テストベクタは将来の Swift ウィジェットと共有）と `src/unit-price` を追記。Commit・push。
- [ ] **Step 4:** ユーザーに Expo Go での実機確認手順（`npx expo start` → QR）を案内。
