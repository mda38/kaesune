# Server State の管理

フロントエンドの Server State は TanStack Query v5 に集約する。対象は現在のユーザー・所属グループ、メンバー、財布、出金、請求。

## 責務と配置

| 配置                                           | 責務                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `lib/api-client.ts`                            | Cookie を含む HTTP 通信、`ApiRequestError`、`AbortSignal` の受け渡し     |
| `lib/query-client.ts`                          | QueryClient の作成、retry・refetch・キャッシュ保持期間、401 の共通通知   |
| `features/*/api.ts`                            | React に依存しない API 関数、レスポンスの取り出し                        |
| `features/*/queries.ts`                        | リソースを所有する feature ごとの query key と `queryOptions`            |
| `features/*/mutations.ts`                      | 更新用 hook と、関連 Query の invalidation                               |
| `features/auth/AuthenticatedQueryProvider.tsx` | 認証中の QueryClient の寿命、401 後のログインへの遷移                    |
| `features/group/GroupProvider.tsx`             | `/api/me` の Query から現在のユーザー・グループを Context で提供         |
| Page・Component                                | Query 結果の表示、入力検証、ローカル入力状態、確認操作、成功後の画面遷移 |

取得結果は Query キャッシュを正本とし、Context・Zustand・Page の state にコピーしない。入力途中の値、フィルター、メニュー開閉、編集中の配分は React のローカル state に置く。汎用 resource hook や repository 層は設けず、取得は `useQuery(featureQueries.list(groupId))`、更新は feature の専用 Mutation hook を利用する。

## Query key と所有者

| 所有する feature | Query key                            |
| ---------------- | ------------------------------------ |
| group            | `["me"]`                             |
| group            | `["groups", groupId, "members"]`     |
| wallet           | `["groups", groupId, "wallets"]`     |
| withdrawal       | `["groups", groupId, "withdrawals"]` |
| claim            | `["groups", groupId, "claims"]`      |

画面名を key に含めない。同じリソースを使う画面は同じ Query を共有する。サーバーへ渡す絞り込み等を追加した場合は、取得条件も key に含める。グループ未確定時は `skipToken` で通信を行わない。

出金詳細・請求詳細・配分画面は、既存と同じく一覧 API を利用し、`select` で対象 ID を取り出す。一覧取得の件数制限も既存のままであり、将来の詳細 API 移行やページネーションは別途扱う。表示用の集計や UI フィルターは取得結果から導出する。

## 共通の取得方針

- `staleTime`: 30秒。時間経過だけでは再取得を開始しない。
- `gcTime`: 利用する画面がなくなってから5分。
- stale な Query は mount、ウィンドウの再表示、通信復帰時に背景再取得する。
- GET の通信障害・5xx は最大2回再試行する。4xx とキャンセルは自動再試行しない。
- Mutation は自動再試行しない。ユーザーがエラーを確認して再操作する。
- Query が渡す `signal` を API 関数から `fetch` へ渡し、不要な取得をキャンセルする。
- 初回取得と背景再取得を区別する。初回はローディング、背景再取得中は既存データを表示する。
- 背景再取得失敗では既存データを保持し、エラーと再試行を併記する。取得失敗を空の一覧や金額ゼロとして扱わない。

## 更新後のキャッシュ整合

| Mutation             | invalidate する Query |
| -------------------- | --------------------- |
| 財布の作成・削除     | 財布一覧              |
| 出金の作成・削除     | 出金一覧              |
| 配分保存と請求発行   | 出金一覧・請求一覧    |
| 請求の状態変更・削除 | 請求一覧・出金一覧    |

無効化は同じ `groupId` の Query に限定する。表示中の Query は再取得し、非表示の Query は stale にして次回表示時に再取得する。Page は再取得対象の知識を持たない。

Mutation のレスポンスが一覧表示型を満たすとは限らないため、更新結果は関連 Query の再取得で確認する。初期導入では楽観的更新や手動の一覧合成を行わない。Mutation hook のキャッシュ更新が完了してから、Page 側の成功コールバックで遷移やフォームリセットを行う。更新成功後の再取得失敗は、更新そのものの失敗とは区別し、Query のエラーとして表示する。

配分保存→請求発行は allocation feature の専用 Mutation で順番に実行する。2つの API を1つのトランザクションとしては扱わない。配分保存後に請求発行だけ失敗した場合や応答が失われた場合にも、`onSettled` で出金・請求を無効化してサーバーの状態を確認する。

## 認証境界

Better Auth の `useSession()` と React Router の保護ルートを継続利用する。QueryClient は保護ルート配下で作成し、`session.user.id` が変われば別のインスタンスになる。ログアウト・保護ルートの unmount 時にキャッシュを破棄し、進行中の GET をキャンセルする。Mutation のサーバー処理自体はキャンセルできないが、以前のユーザーの QueryClient は次のユーザーと共有しない。

QueryCache・MutationCache の401は共通処理でキャッシュを破棄し、ログイン画面へ戻す。ログイン画面へ `reason=session-expired` を渡し、Better Auth のセッションがクライアントに残っていても保護ルートへ戻り続けないようにする。再ログイン成功後にこのパラメーターを外して Home へ遷移する。

キャッシュはメモリ内のみで、永続化しない。HTTP の `Cache-Control: no-store` は引き続き維持し、アプリ内でのキャッシュとは区別する。

## 検証

`pnpm verify:server-state` は Vite のみを起動し、API と認証の固定レスポンスで画面操作を検証する。DB・Worker・環境変数の設定は不要。取得の共有、更新後の別画面への反映、retry、背景再取得失敗、401・ログアウト後の再ログイン、リクエストキャンセルを確認する。実際の Backend・DB との結合を検証するものではない。
