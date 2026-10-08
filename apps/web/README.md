# Okaeshi Web

Vite と React で作るフロントエンドです。

## Setup

```sh
cp apps/web/.env.example apps/web/.env
pnpm --filter web dev
```

`VITE_API_ORIGIN` には Backend Worker の URL を設定します。開発時の既定値は `http://localhost:8787` です。

## テスト・型チェック

```sh
pnpm --filter web test
pnpm --filter web test:watch
pnpm --filter web typecheck
```

`test` は Vitest による単発実行、`test:watch` は変更を監視する継続実行です。
外部 API・DB・認証情報は不要です。`typecheck` はアプリ、テスト、Vite 設定を検証します。
ルートの `pnpm typecheck` からも Turborepo 経由で実行されます。

テストは対象実装と同じディレクトリに `*.test.ts` / `*.test.tsx` として配置します。
既定は `node` 環境で、DOM が必要なテストのみファイル先頭に
`// @vitest-environment jsdom` を記載します。
詳細は [テスト運用](../../docs/development/test-operations.md) を参照してください。

## Production

本番では Web と API を単一の Cloudflare Worker で配信します。公開 URL は
`https://okaeshi-app.daxchx-v1.workers.dev` です。

Web の production build は Backend の deploy command から実行します。`build:production` は
`VITE_API_ORIGIN` に同じ Worker origin を埋め込むため、別 origin の Cookie を使いません。

```sh
pnpm --filter backend run deploy
```

Cloudflare への公開前に、Backend の `DATABASE_URL`、`BETTER_AUTH_URL`、
`BETTER_AUTH_SECRET` を Worker secret として登録してください。手順は
`apps/backend/README.md` を参照してください。

ログイン画面では Backend に seed 済みのメールアドレスとパスワードを入力します。Safari の保存確認を承認すると、次回からログイン情報を自動入力できます。

## Server State

API の取得結果は TanStack Query v5 で管理します。API 関数、Query 定義、Mutation hook、Page の責務とキャッシュ方針は [Server State の管理](../../docs/architecture/server-state.md) を参照してください。

リポジトリのルートで `pnpm verify:server-state` を実行すると、DB 接続を使わず固定レスポンスでブラウザ検証できます。
