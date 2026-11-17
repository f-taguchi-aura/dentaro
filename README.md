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
| `npm run typecheck` | 型チェック |
| `npm run lint` | Lint |
| `npx expo install <pkg>` | SDK対応バージョンでパッケージ追加 |
| `npx expo-doctor` | 依存関係・設定の診断 |

## 構成

- `src/app/` … 画面（Expo Router のファイルベースルーティング）
- `src/components/` `src/hooks/` `src/constants/` … 共通コード
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
