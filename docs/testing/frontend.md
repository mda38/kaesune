# フロントエンドのテスト戦略

[#177](https://github.com/mda38/kaesune/issues/177) の設計を、#176 の構成移行の確認と合わせて確定する。配置の正本は [フロントエンド設計](../architecture/frontend.md)、実行手順は [テスト運用](../development/test-operations.md) と [ローカル検証](../development/local-verification.md)。新しい runner やテスト用のアーキテクチャは追加しない。

## 三層の責務と選定基準

| 層                        | 保証すること                                                                                                                         | 配置・実行環境                                                               | 対象外                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Unit                      | 副作用のない配分計算・境界値・変換。QueryClient や Query Options の設定・キャッシュ操作は同じ node runner で独立検証                 | 対象の隣の `*.test.ts`、Vitest／node                                         | DOM、実 HTTP、認可・DB の正しさ                             |
| Component                 | 入力→検証→表示・送信内容、Hook と UI、loading／error／empty、成功／失敗時のローカル状態。必要な Router／QueryProvider と合わせて検証 | 対象の隣の `*.test.tsx`、Vitest＋Testing Library／jsdom                      | 複数画面の実ブラウザ導線、Backend の業務ルールの再実装      |
| E2E／Browser verification | Router・認証境界・画面遷移・キャッシュの共有・再読込・ユーザー操作を実ブラウザで確認                                                 | `verification/*.spec.ts`、Playwright。固定 API と実 Backend を config で分離 | 計算分岐の網羅、スクリーンショットの自動差分、DB 制約の網羅 |

まず「DOM が不要なら Unit」「入力と画面の接続なら Component」「ブラウザ固有の操作・画面間の整合なら Browser」を選ぶ。API／DB の実際の認可・永続化が目的なら実 Backend の Browser または Backend 統合テストを選ぶ。1つの不具合の全分岐を三層で繰り返さず、Unit の境界値＋Component の代表接続＋Browser の重要導線を組み合わせる。

## 主要機能のテストマトリクス

「既存」は develop `7f06637` に検証コードがあることを示す。実行結果は [移行検証記録](../development/frontend-refactor.md) を参照する。「追加候補」は今後の対象で、既に保証されているとは扱わない。

| 機能               | Unit：正常／異常・境界                                                                                                                                           | Component：正常／異常・表示                                                                 | Browser／実 API：正常／異常                                                                                                                      | 所有 Issue・不足                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 配分・請求発行     | 既存 `allocations.test.ts`：均等・全額・端数・0人／1人／0円・不正／空欄・大整数・合計不足／超過・shared／personal                                                | 既存 `allocation.test.tsx`：プリセット・手入力・プレビュー・発行可否・payload・成功後の遷移 | 固定 API：発行成功と一覧更新、配分保存のみ成功した際のエラーと再操作。実 API：`claim-create.spec.ts` の再読込と保存配分の復元                    | #115・#122 完了、実 API の実行確認は #116                                   |
| 出金フォーム       | 既存 `withdrawal-form.test.ts`：金額・日付初期値・用途／メモの空白処理・不正値                                                                                   | フォーム単体の DOM テストは追加候補。純粋検証関数の成功を DOM 操作の成功とは扱わない        | 固定 API：登録・削除、API失敗時の入力保持、Escape 後の初期化。focus：初期フォーカス・Tab。実 API：登録の再読込、削除キャンセル・配分済の削除不可 | #123 完了、#116 の実 API 検証。#128・#129 の utility 変更時に境界値を補完   |
| 財布               | 作成検証の単独 utility は現在ない。フォームから再利用する要件が生じた時だけ抽出・テスト                                                                          | `WalletForm`／`WalletList` 単体の DOM テストは追加候補                                      | 固定 API：作成／削除の他画面反映、空白名・所有者未選択、成功後リセット、失敗時入力保持・再操作。実 API：未参照削除、参照中削除拒否と再読込       | #117・#125 完了。#116 は実 Backend の結果確認が残る                         |
| 取得・キャッシュ   | 既存 `query-client.test.ts`：4xx／AbortError の retry 抑止、5xx の上限、401 の破棄。出金・請求の `query-options.test.ts`：一覧初期値・時刻・無効化済み一覧の除外 | loading／empty／初回 error の個別 DOM テストは追加候補                                      | 既存固定 API：画面間共有、更新後の再取得、背景失敗でも既存金額保持、手動 retry、404                                                              | #118 完了、#126 で表示分岐を追加する際に DOM テストを追加                   |
| 認証・分離         | 既存 QueryClient の401通知。MutationCache の通知を独立検証するテストは追加候補                                                                                   | 保護ルートの pending／未認証表示の DOM テストは追加候補                                     | 既存固定 API：Query／Mutation の401、ログインへの帰還、再ログイン・ログアウト後の別ユーザーで旧キャッシュ非表示                                  | #119 完了。実 API のログイン全導線は現在の4 scenario の対象外               |
| race condition     | Query key の group／ID 別分離を専用に検証するテストは追加候補                                                                                                    | group／route 切替後の遅延応答の DOM テストは追加候補                                        | 既存固定 API：未完了取得中の画面離脱→キャンセル→戻った画面の最新表示                                                                             | #120 完了。別 group／ID の逆順応答の専用 scenario は未追加                  |
| 共通 UI・配置      | 既存 `eslint-config.test.ts`：配置・依存・import・命名関連の規則                                                                                                 | 既存 `avatar.test.tsx`：名前と既定値のアクセシブルなラベル                                  | focus spec：ログイン・財布・配分・Home・Mypage・出金の操作。自動 visual regression は現在ない                                                    | #124・#175 完了。visual regression は #142                                  |
| API 応答・業務認可 | API client の204・非JSON・壊れたJSON・未知のエラー形状は追加対象                                                                                                 | Frontend は401／403／409／5xxなどの応答に対する表示・操作だけ保証                           | 他グループ拒否、DB制約、ロールバック、同時更新の正しさは Backend 統合テストへ割り当てる                                                          | #130 応答単体、#127 契約共有。認可は #152・#156、DB整合は #154、競合は #149 |

楽観的更新は現在採用していない。現在の保証対象は Mutation 後の invalidation と再取得、部分成功後の整合である。将来採用する変更では、QueryClient のキャンセル・保存・復元を node テスト、UI の仮表示・失敗後の復元を Component、画面間整合を Browser に追加する。

## API の置き換え方と実 Backend の使い分け

| 方法                                      | 利点・確認できること                                                    | 限界・運用                                                                 | 採用判断                                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `vi.mock` による API／Mutation 境界の置換 | 入力・表示・送信 payload・成功／失敗コールバックを外部環境なしで制御    | HTTP の実装やキャッシュ無効化を同時には保証しない                          | 既存の配分 Component 接続テストを継続。キャッシュを確認したいテストでは実 QueryClient を使う |
| Playwright `page.route` の固定 API        | 認証・HTTP status・遅延応答を制御し、実画面・Router・Query の連携を検証 | Backend の認可・DB・レスポンス契約の正しさは保証しない                     | 現行の Server State／focus の方式を継続                                                      |
| MSW 等による共通 HTTP mock                | 複数の Component テストで同じ HTTP fixture を共有する候補               | mock の別管理・新依存が増える。現状の少数 DOM テストには導入を必要としない | 今回は導入しない。同じ HTTP mock が増えた時に、API境界の置換との維持コストを比較して判断     |
| 検証専用 Backend＋DB                      | 認証・HTTP・永続化・再読込を含む契約接続を確認                          | DB設定・migration・seed が必要で、共有 fixture を使うため直列実行          | #116 の4 scenario を使用。全計算分岐や認可網羅は Backend テストへ分担                        |

mock の型は所有 Feature から `import type` する。固定レスポンスが Backend 契約と一致する保証は #127 で扱う。実 API の削除拒否 scenario が通っても、全ての他グループアクセスや DB 制約が検証されたことにはならない。

## 配置・命名・実行環境

- テストは実装の隣の `*.test.ts`／`*.test.tsx`。業務所有者を変えず、barrel や共有テスト専用 Feature を作らない。既存の `app/routes/app/records/allocation.test.tsx` は route とフォームの接続を確認するためそのまま保持する。
- `describe` は検証対象、`it`／`test` は「条件・操作と期待される結果」を記載する。実装内部の関数呼出し順だけを assertion にせず、入力・表示・送信データ・キャッシュ状態を観測する。
- Vitest は `apps/web/vite.config.ts` の `environment: "node"` を既定とし、DOM テストの先頭へ `// @vitest-environment jsdom` を記載する。`src/**/*.test.{ts,tsx}` のみ検出し、Playwright spec は含めない。
- `src/test/setup.ts` が jest-dom と各テスト後の Testing Library `cleanup()` を提供する。node テストから browser API を前提にしない。
- React テストは Testing Library の `render`／`screen`／`fireEvent` と、必要時の `act`・非同期 assertion を利用する。実時間の待機ではなく、完了状態・可視要素・request の完了を待つ。

## Provider とテストデータの隔離

現行の配分接続テストはテスト内に `renderPage` を持ち、QueryClient・GroupContext・MemoryRouter を生成する。全画面用の共通 render helper は作らない。複数のテストで同じ Provider 設定が必要になった時だけ `src/test/` へドメインを知らない helper を抽出する。

- QueryClient はテストごとに作り、singleton を共有しない。cache seed は所有 Feature の `queryOptions.queryKey` から設定する。
- 表示・操作の接続テストは `retry: false`、必要な seed を `staleTime: Infinity` にして余分な通信を避ける。retry／refetch 自体のテストでは `createQueryClient` の実設定を使い、retry delay や時計だけを制御する。
- QueryClient を使う非同期テストは unmount／cleanup 後に `client.clear()`、mock・時計・イベント listener を復元し、進行中の request を次のテストへ残さない。既存テストは各テストで client を生成しており、共有 cache は使わない。
- Playwright の固定 API は各テストの page と state に閉じる。遅延 request は解放可能な Promise と cancellation の観測を使い、タイムアウト任せの sleep にしない。
- 実 Backend は検証専用 DB の固定 fixture を使い、各 `pnpm verify:<feature>` の seed から開始する。4コマンドを並列にせず、認証は共通 helper の API ログインを使う。ユーザーのログインフォーム操作はこの4 spec では保証しない。
- 本番データ・本番認証を使わない。環境変数の値やパスワードを artifact／ログへ出力しない。

## 主要導線と実行コマンド

| 系統             | コマンド                     | シナリオ・失敗時の確認                                                                                                                                        |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit＋Component  | `pnpm --filter web test`     | 外部 API／DB 不要。計算分岐・フォーム接続・Query 設定を同じ Vitest で実行                                                                                     |
| 固定 API Browser | `pnpm verify:server-state`   | 財布・出金の登録／削除、配分保存→請求発行→精算／削除、401・ユーザー切替・retry・背景失敗・キャンセル・詳細404。失敗時は `test-results/server-state/` の trace |
| 操作・focus      | `pnpm verify:focus`          | Tab、金額欄の初期 focus、Escape、ログイン・主要画面。保存先は `playwright.focus.config.ts` を参照                                                             |
| 実 API：出金登録 | `pnpm verify:payment-create` | 登録→記録一覧→再読込、入力初期値と保存内容                                                                                                                    |
| 実 API：出金削除 | `pnpm verify:records-delete` | キャンセル→削除→再読込、配分済みは削除操作を表示しない                                                                                                        |
| 実 API：請求発行 | `pnpm verify:claim-create`   | 配分保存→発行→請求一覧→再読込、配分画面への再訪で保存内容を復元                                                                                               |
| 実 API：財布削除 | `pnpm verify:wallet-delete`  | 未参照削除／参照中拒否→再読込。失敗時の trace／screenshot、成功時の artifact はローカル検証手順を参照                                                         |

実 API の4コマンドは [環境変数・DB の準備](../development/environment-variables.md) 後に直列実行する。spec 検出や mock の成功を実 Backend の成功に置き換えない。

## 既存 Issue・CI への割り当て

| Issue       | 所有する範囲                                           | 今回との関係                                                                     |
| ----------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| #114 closed | Vitest・jsdom・setup・実行 script                      | 導入済み。今回 runner を増設しない                                               |
| #115 closed | 配分の純粋関数と境界値                                 | 既存テストを利用                                                                 |
| #116 open   | 実 Backend 用の固定 scenario、seed、artifact、実行確認 | #174 でコードは導入済み。実 Backend／DB の成功確認を残す                         |
| #138        | Unit＋Component の affected CI 品質ゲート              | `test --affected --filter=web` を CI に接続。Backend と Browser の導入は含めない |
| #177        | 三層の境界・選定基準・実装順                           | 本書で設計を確定。テスト不足の全実装を完了した意味ではない                       |

CI は全体 format の後に `pnpm exec turbo run test --affected --filter=web --cache-dir=.turbo` で Unit＋Component を実行し、成功後に affected な lint／typecheck／build を実行する。1件でもテスト失敗・実行エラーがあれば非ゼロ終了で品質ゲートを失敗させる。`test` task は Turbo に登録し、CI は `--filter=web` で Web に限定する。差分の base／head は既存の品質チェックと共通にし、対象 Web に影響のない変更ではテストを実行しない。具体的な確認手順は [CI 品質ゲート](../development/ci-quality-gate.md) を参照する。

Browser／実 DB は当面ローカル検証を継続し、Unit の高速な品質ゲートへ混在させない。coverage の数値閾値は今回設けず、金額・認証・更新後整合の上記マトリクスをレビュー基準とする。追加・実行は #114→#115→主要フォーム接続→#116 の実結合→#138 の CI の順を基本とし、#138 で既存153件を affected CI に接続した。
