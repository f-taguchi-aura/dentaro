# でんたろー（dentaro）

もんたろー（Montaro）制作の、自分用 iPhone / Android 電卓アプリ。通常電卓⇔2画面電卓の切り替えと、お得比較機能を持つ。[Expo](https://expo.dev)（React Native + TypeScript）で1つのコードから両OS向けにビルドします。

## 開発の始め方

```bash
npm install
npx expo start
```

表示されたQRコードを、スマホの **Expo Go** アプリ（iPhone はカメラアプリ）で読み取ると実機で動作確認できます。

## よく使うコマンド

| コマンド | 内容 |
| --- | --- |
| `npx expo start` | 開発サーバー起動 |
| `npm test` | テスト |
| `npm run typecheck` | 型チェック |
| `npm run lint` | Lint |
| `npx expo install <pkg>` | SDK対応バージョンでパッケージ追加 |
| `npx expo-doctor` | 依存関係・設定の診断 |

## 構成

- `src/app/` … 画面（Expo Router）。`index.tsx`＝電卓タブ、`compare.tsx`＝お得比較タブ
- `src/calc/` … 電卓の計算ロジック。`test-vectors.json` は正解の一覧で、将来の iPhone ウィジェット（Swift）でも同じものを使って検証する
- `src/unit-price/` … お得比較の計算
- `src/components/` `src/theme/` `src/storage/` … 画面部品・配色・端末への保存
- `app.json` … アプリ名・アイコン・Bundle ID などの設定
- `eas.json` … クラウドビルド（EAS Build）の設定

## 実機にインストールする（EAS Build）

Mac や Xcode がなくてもクラウドでビルドできます。

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # APK を作成
npx eas-cli@latest build --profile preview --platform ios       # Apple Developer 登録が必要
```

- Bundle ID / パッケージ名: `jp.montaro.dentaro`
- iPhone への配布には Apple Developer Program（有料）への登録が必要です。
