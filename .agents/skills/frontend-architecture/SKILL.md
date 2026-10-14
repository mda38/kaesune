---
name: frontend-architecture
description: Kaesune の apps/web で新規実装・移動・レビューを行うときに、Feature の所有権、配置、依存方向、Query と Mutation の責務を判断する。
---

# フロントエンドの配置判断

リポジトリルートから [フロントエンド設計](../../../docs/architecture/frontend.md) と [Server State](../../../docs/architecture/server-state.md) を読む。リンクはリポジトリ内の設置先 `.agents/skills/frontend-architecture/` からの相対パス。規則の正本は設計文書とし、ここに別の配置ルールを増やさない。

## 実装・移動

- URL、認証境界、複数 Feature の画面 composition は `app/routes/`、ルート定義は `app/router.tsx` に置く。`pages/` を作らない。
- ドメイン所有者は設計文書の所有権表で決める。HTTP 通信は `api/`、Query Options と取得・更新 hook は `queries/`、ドメイン UI は `components/`、ローカル状態の hook は `hooks/`、純粋処理は `utils/`、共有するドメイン型は `types/` に置く。型だけを参照する利用元へ所有権を移さない。
- 共通 UI は `components/ui/`、画面の枠・ナビゲーションは `components/layouts/`。利用元が増えただけでドメイン UI を共有層へ移さない。
- `query-options.ts` の key を取得・prefetch・invalidate・initialData で再利用する。`use-xxx-query.ts` / `use-xxx-mutation.ts` を使い、更新後のキャッシュ整合を画面へ移さない。
- Feature 間参照は設計文書の許可表を照合する。許可のない組み合わせは `app/` で合成する。新しい依存が必要なら所有権を再検討し、設計と ESLint を同じ変更で更新する。
- kebab-case と `@/` import を使い、定義ファイルから直接参照する。空ディレクトリや再 export の入口を作らない。

## レビュー

変更ファイルごとに「所有ドメイン → 責務 → 処理」の順で配置理由を確認する。設計文書の判断例と移行表を照合し、API 契約・Query key・認証ごとの QueryClient の寿命が変わっていないか確認する。移動に伴う import とテストの参照先も確認する。

規約違反は `pnpm --filter web lint`、型と既存動作は `pnpm --filter web typecheck`、`pnpm --filter web test` で確認する。ルートやキャッシュへ影響する変更では `pnpm verify:server-state` を実行する。共通の検証範囲は `docs/development/local-verification.md` に従う。
