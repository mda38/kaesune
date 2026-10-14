# フロントエンドの構成

`apps/web/src` は Bulletproof React の Feature-based Architecture を基盤に、**ドメイン → 責務 → 処理**の順で分類する。配置判断の正本はこの文書とし、[コーディング規約](../development/frontend-coding-guidelines.md)と [Server State](server-state.md)を併用する。

## 参照元と採用する規則

2026-10-14 に upstream の commit `9506629ed003a561c6627735480cce4994244bb4` を確認した。

- [Project Structure](https://github.com/alan2207/bulletproof-react/blob/9506629ed003a561c6627735480cce4994244bb4/docs/project-structure.md)
- [React Vite の app](https://github.com/alan2207/bulletproof-react/tree/9506629ed003a561c6627735480cce4994244bb4/apps/react-vite/src/app)
- [router.tsx](https://github.com/alan2207/bulletproof-react/blob/9506629ed003a561c6627735480cce4994244bb4/apps/react-vite/src/app/router.tsx)

| 観点               | Kaesune での採用・差分                                                                                | 理由                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| アプリ層           | `app/app.tsx`、`app/router.tsx`、`app/routes/` を採用                                                 | URL と画面 composition をドメイン実装から区別する                                                                     |
| Feature            | ドメイン別に責務ディレクトリへ配置                                                                    | ファイルの所有者と処理の種類を先に決める                                                                              |
| API と Query       | upstream の `api/` に含まれる取得・更新 hook を `queries/` に分離                                     | HTTP 通信を React に依存させず、Options を画面外でも再利用する                                                        |
| Query と Mutation  | 両方 `queries/` に置き、`mutations/` は作らない                                                       | キャッシュ整合を同じ責務で扱う                                                                                        |
| Feature 間依存     | upstream はアプリ層での合成を推奨。Kaesune は後述の方向・責務だけ許可                                 | 配分は出金・財布・メンバー・請求を扱い、請求更新は出金キャッシュにも影響する。型や key の複製を避ける                 |
| 共有層             | `components/ui/` と `components/layouts/` に区別                                                      | 見た目の部品と画面の枠を一意に分類する                                                                                |
| エントリ・Provider | upstream の `index.tsx` / `provider.tsx` をそのまま作らず、既存の `main.tsx` と認証内 Provider を維持 | QueryClient の寿命をユーザーごとに分離するため。全画面共通 Provider が必要になった時点で `app/providers.tsx` を設ける |
| import             | 定義ファイルへ `@/` で直接参照し、barrel を作らない                                                   | upstream の直接 import 方針と既存の lint 規約を採用                                                                   |
| 任意ディレクトリ   | 必要な責務だけ作る                                                                                    | 空の雛形や未使用の抽象層を増やさない                                                                                  |

## ディレクトリ責務

```text
src/
├── main.tsx
├── app/
│   ├── app.tsx
│   ├── router.tsx
│   └── routes/
│       ├── login.tsx
│       └── app/
│           ├── root.tsx
│           ├── home.tsx
│           ├── records/
│           └── invoices/
├── features/{domain}/{responsibility}/{operation}
├── components/
│   ├── ui/
│   └── layouts/
├── lib/
├── assets/
├── styles/
└── test/
```

| 配置                            | 責務と判定基準                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `main.tsx`                      | DOM への mount、StrictMode、共通 CSS の読込                                                                             |
| `app/app.tsx`                   | RouterProvider の入口                                                                                                   |
| `app/router.tsx`                | URL・パラメーター・認証境界のルート定義                                                                                 |
| `app/routes/`                   | 公開ルートの入口                                                                                                        |
| `app/routes/app/`               | 認証が必要な画面の入口。パラメーター、遷移、複数 Feature の composition、画面固有の表示・入力状態                       |
| `features/{domain}/api/`        | HTTP 操作単位の関数。React / Query hook を含めない。`get-group-wallets.ts` など処理名で命名                             |
| `features/{domain}/queries/`    | `query-options.ts` の Query key / Options と、取得 `use-xxx-query.ts`・更新 `use-xxx-mutation.ts`。キャッシュ更新もここ |
| `features/{domain}/components/` | ドメインの表示や操作を担う UI。1画面だけで使う UI もここ                                                                |
| `features/{domain}/hooks/`      | Query 以外の React hook。フォームのローカル状態、Context の参照など                                                     |
| `features/{domain}/types/`      | API 入出力・ドメイン型。処理固有の非公開型や Props は使用ファイル内に置く                                               |
| `features/{domain}/utils/`      | React に依存しないドメインの計算・検証・変換                                                                            |
| `features/{domain}/contexts/`   | Context とその value 型。Provider は `components/`、参照 hook は `hooks/`                                               |
| `features/{domain}/lib/`        | ドメイン固有の外部ライブラリ設定。現在は auth の Better Auth client                                                     |
| `features/{domain}/data/`       | ドメイン固有の固定表示データ。サーバー状態や Query の代替にはしない                                                     |
| `components/ui/`                | 業務型・API・Feature を知らない UI 部品                                                                                 |
| `components/layouts/`           | 画面の枠、見出し、ナビゲーション。URL のリンク先を持てるが認証・Query は扱わない                                        |
| `lib/`                          | HTTP client、QueryClient 設定などドメイン非依存の基盤                                                                   |
| `assets/` / `styles/`           | 静的画像と共通 CSS                                                                                                      |
| `test/`                         | 共通 setup と lint 設定のテスト。機能テストは対象ファイルの隣に配置                                                     |

Feature 直下へ実装ファイルを置かない。すべて kebab-case とし、テストは対象と同じ責務へ `*.test.ts(x)` として置く。将来、ドメインを知らない共有 hook・型・純粋関数が必要になった場合だけ `src/hooks/`・`src/types/`・`src/utils/` を作る。現在のドメイン型を便宜的にそこへ移さない。

## ドメインの所有権

| Feature    | 所有するもの                                                       | 所有しないもの                                                         |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| auth       | Better Auth client、認証中の QueryClient の寿命                    | 保護ルートの composition（app）、`/api/me` の所属グループ情報（group） |
| group      | `/api/me` の CurrentUser / Group、メンバー、現在のグループ Context | Better Auth の session                                                 |
| wallet     | 財布と作成・削除、財布 UI                                          | 出金の入力・記録                                                       |
| withdrawal | 出金の取得・作成・削除、出金入力と一覧・詳細部品、金額入力処理     | 配分の編集・請求発行                                                   |
| allocation | 配分計算・入力検証、配分保存→請求発行の一連の操作、配分 UI         | 請求一覧・状態変更、出金の正本型                                       |
| claim      | 請求一覧・詳細・精算状態変更・削除、請求 UI                        | 配分を保存してから請求を生成する操作（allocation）                     |

URL 上の `records` は withdrawal、`invoices` は claim に対応する。`home`・`mypage` は複数ドメインや認証情報の composition なので、新しい Feature を作らない。`AllocationInput` は allocation、応答の `Withdrawal` は withdrawal、`Claim` は claim が所有する。現在の API 入出力型はフロントエンドの型であり、Backend から共有生成する契約の導入は #127 で扱う。

## 依存方向と共有化

import する側から、`app → features → shared` の方向を守る。`app` は shared も直接使える。shared は `components/`、`lib/`、`assets/`、`styles/` と、必要時の共有 `hooks/`・`types/`・`utils/`。shared から Feature・app、Feature から app は参照しない。

Feature 間参照は次の表の組み合わせだけ許可する。表にない組み合わせは app で合成する。許可対象の責務でも、型は `import type`、処理は定義ファイルから直接参照する。

| 参照元     | 参照先     | 許可する責務         | 用途                                           |
| ---------- | ---------- | -------------------- | ---------------------------------------------- |
| withdrawal | group      | `hooks/`、`types/`   | 現在のグループで出金を入力                     |
| withdrawal | wallet     | `queries/`、`types/` | 出金元財布の選択                               |
| claim      | withdrawal | `queries/`           | 請求状態変更・削除による出金キャッシュの更新   |
| allocation | group      | `types/`             | メンバーごとの配分計算                         |
| allocation | wallet     | `types/`             | 返済先財布の所有者の判定                       |
| allocation | withdrawal | `queries/`、`types/` | 出金をもとに配分を保存し、出金キャッシュを更新 |
| allocation | claim      | `queries/`、`types/` | 発行結果の型と請求キャッシュの更新             |

auth・group・wallet は他 Feature を参照しない。これにより `allocation → claim → withdrawal → wallet / group` は循環しない。`api/`・`types/`・`utils/` から Feature の UI・hook・Query や共通 Component も参照しない。

共有化は「複数箇所で使う」だけでは決めない。ドメイン型・ルールを知らずに説明できる部品だけ共有層へ置く。例えば WalletSection は複数画面で使っても wallet、Card は共通 UI、Screen / BottomNav は layout。API 型を再 export して入口を増やしたり、依存制約を回避するため shared に業務ロジックを押し込んだりしない。

旧ディレクトリ・Feature 直下の実装・未定義のドメイン／責務・Query ファイルの命名と依存方向は `apps/web/eslint.config.js` の `local/architecture`、名前・import・Component は既存規則で検査する。所有権・共有化判断は設計文書と Skill でレビューする。新しい Feature・責務・依存が必要になったら既存の所有権を検証し、この文書と lint を同時に見直す。

## ルート命名と認証境界

URL は変更せず、保護ルートのファイルだけ `app/routes/app/` 配下にまとめる。ファイルの `app/` は URL prefix ではない。コレクションは名前を繰り返す入口、詳細は単数 `*-detail.tsx` とし、配分は出金の後続操作として records に置く。

| URL                                 | `app/routes/` からの配置          |
| ----------------------------------- | --------------------------------- |
| `/`                                 | `login.tsx`                       |
| 保護ルート共通                      | `app/root.tsx`                    |
| `/home`                             | `app/home.tsx`                    |
| `/records`                          | `app/records/records.tsx`         |
| `/records/:withdrawalId`            | `app/records/record-detail.tsx`   |
| `/records/:withdrawalId/claims/new` | `app/records/allocation.tsx`      |
| `/invoices`                         | `app/invoices/invoices.tsx`       |
| `/invoices/:claimId`                | `app/invoices/invoice-detail.tsx` |
| `/mypage`                           | `app/mypage.tsx`                  |
| `/wallets`                          | `app/wallets.tsx`                 |
| `/group`                            | `app/group.tsx`                   |

`root.tsx` の RequireSession は session 確定前の表示、未認証の `/` 遷移、`session.user.id` を key とする AuthenticatedQueryProvider → GroupProvider → Outlet の順を維持する。401、ログアウト、ユーザー切替、unmount 時の QueryClient 破棄は [Server State](server-state.md) の通り。ログインの QueryClient を全画面共通 Provider に引き上げない。

## Query と Mutation

`queries/query-options.ts` を key と Options の唯一の定義場所にする。取得 hook はその Options を `useQuery` に渡し、詳細 hook は `useQueryClient` を渡して一覧の initialData と時刻を再利用する。prefetch / invalidate / テストの seed は同じ Options を直接使う。画面で key を手書きしない。

```tsx
// features/wallet/queries/use-wallets-query.ts
export const useWalletsQuery = (groupId: string | undefined) => {
  return useQuery(walletQueries.list(groupId));
};
```

API は `AbortSignal` を受け取り HTTP client へ渡す。group / ID 未確定時の `skipToken`、詳細 API の404→null、無効化済み一覧を initialData に使わない規則を維持する。Query Options 内の一覧参照にも同じ `list(...).queryKey` を使う。

| 更新 hook             | キャッシュ整合                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| wallet の作成・削除   | 同一 group の財布一覧を invalidate                                                                |
| withdrawal の作成     | 同一 group の出金一覧を invalidate                                                                |
| withdrawal の削除     | 詳細を null にし、出金一覧（prefix に含まれる詳細も）を invalidate                                |
| claim の状態変更      | 請求一覧・出金一覧を invalidate                                                                   |
| claim の削除          | 請求詳細を null にし、請求一覧・出金一覧を invalidate                                             |
| allocation の請求発行 | 配分保存→請求発行を順に実行し、部分成功・失敗も含め `onSettled` で出金一覧・請求一覧を invalidate |

Mutation はキャッシュ更新の Promise を返す／await する。画面の成功コールバックは完了後に遷移・入力リセットを行い、画面自身は invalidate しない。楽観的更新・Query key・retry・staleTime 等の仕様は今回変更しない。

## 配置判断の例と禁止事項

| 追加・レビューするもの                             | 判断                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 財布削除 API と hook                               | `wallet/api/delete-group-wallet.ts` と `wallet/queries/use-delete-wallet-mutation.ts` |
| 財布作成フォームのローカル状態 hook                | `wallet/hooks/use-wallet-form.ts`。Query hook と混ぜない                              |
| 配分の端数計算                                     | `allocation/utils/allocations.ts`。route に実装しない                                 |
| 請求発行画面の URL パラメーターと複数 Query の表示 | `app/routes/app/records/allocation.tsx`                                               |
| 請求一覧・詳細のメッセージ                         | `claim/components/`。表示が似ているだけで共通 UI にしない                             |
| サーバーの Wallet 型                               | `wallet/types/wallet.ts`。API ファイルや shared で再定義しない                        |
| 新しい業務無関係のボタン                           | `components/ui/`                                                                      |

禁止: トップレベル `pages/`・`routes/`・`layouts/`、`features/*/pages/`、Feature 直下への実装、`mutations/`、barrel、相対 import、逆方向・未許可の Feature 間参照、画面ごとの Query key、空ディレクトリ、配置移行に伴う API 契約や URL の変更。

## 移行手順と関連 Issue

#175 では次の順で移行した。各段階で API のパス・入出力と Query key を保ち、最終的に型・lint・既存テスト・画面 verification で確認する。

1. 全ファイルを[移行表](frontend-file-migration.md)へ記録し、所有者を確定する。
2. routes / pages を app へ、layouts を共通 Component へ移動し、import を更新する。
3. API を HTTP 操作単位、型をドメイン単位、純粋処理とローカル hook を責務別に分ける。
4. Query Options を `queries/query-options.ts`、Mutation を操作別 hook へ移動する。
5. 専用 Query hook を作り、画面と Provider の参照を切り替える。キャッシュや QueryClient の寿命を変えない。
6. 依存方向の lint、Skill、文書を整合させ、format / lint / typecheck / test / build と mock の browser verification を行う。

| Issue                                                                | 今回との関係                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [#127](https://github.com/mda38/kaesune/issues/127) API 契約         | 型の所有者と通信境界を整理する。契約の生成・Backend 共有は扱わない           |
| [#125](https://github.com/mda38/kaesune/issues/125) WalletsPage 分割 | 既存 WalletSection は Feature へ移す。フォームや画面状態の追加分割は扱わない |
| [#126](https://github.com/mda38/kaesune/issues/126) 状態表示共通化   | メッセージを所有 Feature へ移し、UI の共通化は扱わない                       |
| [#121](https://github.com/mda38/kaesune/issues/121) 詳細 API         | 既存の詳細取得と initialData の挙動を維持する                                |
| [#116](https://github.com/mda38/kaesune/issues/116) verification     | 既存 scenario を移行の回帰確認に使用する。外部 DB を伴う検証の追加は扱わない |

## Skill の運用

リポジトリ共有の Skill は [.agents/skills/frontend-architecture/SKILL.md](../../.agents/skills/frontend-architecture/SKILL.md) に置く。新規実装・移動・レビューの配置判断を案内し、詳細規則は本書を参照する。Codex のリポジトリ Skill として自動検出し、`$frontend-architecture` でも指定できる。個人のホームディレクトリへは配置しない。
