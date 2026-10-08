# テスト運用

テストを追加・実行する基準

## 目的

変更内容に応じて、どの種類のテストをいつ実行するかを明確にする。

## 現状

- Backend には Vitest による unit test がある
- Frontend には Vitest と React Testing Library による unit test がある
- 重要な画面フローは、必要に応じて Playwright の固定 verification scenario として追加する
- Browser verification はローカル環境の再現可能な fixture を使い、まず `pnpm verify:<feature>` として実行する
- Browser verification は現時点では CI に載せず、ローカルで安定して再現できることを優先する
- `verification/` の feature spec は出金登録・出金削除・請求発行・財布削除を実 Backend と検証専用開発 DB で確認する。実行条件・fixture 復元・失敗時の trace / screenshot は [ローカル検証手順](local-verification.md) を参照する
- API mock の `server-state.spec.ts` は `playwright.query.config.ts` で分離し、実 Backend を使う feature spec とは混在させない

## ローカル運用

- 実装中は、必要な範囲のテストをその都度ローカルで実行する
- Frontend は `pnpm --filter web test:watch` で変更を監視し、継続的に確認できる

### Frontend unit test

```sh
pnpm --filter web test
pnpm --filter web test:watch
pnpm --filter web typecheck
```

- `test` は単発実行で、失敗時は非ゼロの終了コードを返す
- 実行には外部 API・DB・認証情報を必要としない
- テストは対象実装に隣接する `*.test.ts` / `*.test.tsx` に配置する
- 検出対象は `apps/web/src` 配下のみで、Playwright verification は含めない
- 純粋関数や DOM に依存しない状態管理は、既定の `node` 環境で検証する
- DOM を使うコンポーネント・Hook は、ファイル先頭に `// @vitest-environment jsdom` を記載する
- React の描画・操作には React Testing Library を使う。共通 setup が各テスト後に cleanup する
- `describe`・`it`・`expect` などは `vitest` から明示的に import する
- DOM の assertion には共通 setup で読み込む `@testing-library/jest-dom/vitest` の matcher を使える
- `typecheck` はアプリ、テスト、共通 setup、Vite 設定を対象とする
- ルートの `pnpm typecheck` と既存 CI の affected typecheck にも Frontend が含まれる
- unit test の CI 実行、coverage 閾値の導入は別途対応する

### 実行の考え方

- 純粋関数やドメインロジックは unit test を優先する
- API 境界や DB を伴う処理は integration test を優先する
- 重要なユーザーフローは e2e test を検討する
- UI の変更や削除などの破壊的操作は、実画面を通す固定 Playwright scenario を優先する

## 追加基準

次のいずれかに当てはまる場合は、テスト追加を優先する。

- ロジックが複雑で、手動確認だけでは戻りやすい
- 仕様変更時の回帰リスクが高い
- 複数レイヤーにまたがる処理で、壊れたときの影響が大きい

## CI への導入条件

- テストスクリプトが定義されている
- ローカルで安定して再現できる
- 失敗時に原因を追える出力になっている
- Turborepo の affected 対象に自然に載せられる

## 今後の方針

- テスト種別ごとに実行コマンドを分ける
- まずは壊れやすい中核ロジックから増やす
- CI には整備できたテストから順次追加する
