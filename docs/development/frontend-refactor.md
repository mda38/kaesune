# フロントエンド構成移行の実行順と検証結果

[#176](https://github.com/mda38/kaesune/issues/176) の実行記録。2026-10-14 時点の develop `7f06637`（[PR #179](https://github.com/mda38/kaesune/pull/179) マージ後）を基準とする。旧10/09〜10/13は作業区分として残し、実際の着手順は依存関係で決める。

配置・所有権・依存方向の正本は [フロントエンド設計](../architecture/frontend.md)、取得・認証・更新後の整合の正本は [Server State](../architecture/server-state.md)。本書では規則を再定義しない。

## 実行順と既存 Issue の対応

既存実装のマージ順と、今後の変更で守る依存順は異なる。例えば #175 の一括配置移行後、#179 で #122 の画面分離を補完した。完了した段階は再実装しない。

| 依存順 | 旧日程           | 作業・既存 Issue                                                            | 対象ファイル（リポジトリルートから）                                                                                                                                                                    | 実装・現在の状態                                                                                                                                                                                                                                                                                                            |
| ------ | ---------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | 10/09 設計       | #175 配置・所有権・移行表の確定                                             | `docs/architecture/frontend.md`、`frontend-file-migration.md`、`.agents/skills/frontend-architecture/SKILL.md`、`apps/web/eslint.config.js`                                                             | [PR #178](https://github.com/mda38/kaesune/pull/178) マージ済み。移行先の全件照合は本書の検証表を参照                                                                                                                                                                                                                       |
| 2      | 10/10 通信基盤   | #117・#118・#119・#120 の財布／Server State／401／キャンセル統一            | `apps/web/src/lib/{api-client,query-client}.ts`、`features/auth/components/authenticated-query-provider.tsx`、各 Feature の `api/`・`queries/`、`features/group/components/group-provider.tsx`          | [PR #146](https://github.com/mda38/kaesune/pull/146) と #178 で反映済み。4 Issue は closed。#127・#130 の契約／応答堅牢化は別作業                                                                                                                                                                                           |
| 3      | 10/11 主要画面   | #114 のテスト基盤→#115 の純粋関数→#122・#123・#125 の画面分離               | `apps/web/vite.config.ts`、`src/test/setup.ts`、`features/allocation/{utils,hooks,components}/`、`features/withdrawal/{utils,hooks,components}/`、`features/wallet/components/`、対応する `app/routes/` | [PR #167](https://github.com/mda38/kaesune/pull/167)・[#169](https://github.com/mda38/kaesune/pull/169)・[#171](https://github.com/mda38/kaesune/pull/171)・[#172](https://github.com/mda38/kaesune/pull/172)・[#179](https://github.com/mda38/kaesune/pull/179) マージ済み。#122 は #178 後に #179 で再分離。すべて closed |
| 4      | 10/12 構成統一   | #175 に沿う API／型／Query／Mutation／route／layout の移行。#135 の命名確認 | `apps/web/src/` 全体（[全ファイル移行表](../architecture/frontend-file-migration.md)）                                                                                                                  | #178・#179 で配置統一済み。#135 の `PaymentDialog`／`PaymentDialogHandle` は残存し、別 PR の候補                                                                                                                                                                                                                            |
| 5      | 10/13 テスト戦略 | #177 の三層の責務→#116 の実 Backend 検証完了→#138 の CI 品質ゲート          | `docs/testing/frontend.md`、`verification/`、`playwright*.config.ts`、`.github/workflows/ci.yml`、`turbo.json`                                                                                          | [テスト戦略](../testing/frontend.md) を今回確定。#114 は完了、#116 は spec 整備済みだが実 DB 検証未完、#138 は未実装                                                                                                                                                                                                        |

#121 の詳細 API は [PR #170](https://github.com/mda38/kaesune/pull/170) で先行実装され、#172 はその取得方式に依存していた。#124 の focus は [PR #173](https://github.com/mda38/kaesune/pull/173)、#116 の scenario 整備は [PR #174](https://github.com/mda38/kaesune/pull/174) を参照する。

## 移行単位と確認方法

過去 PR を作り直さず、今後の変更も次の単位で分ける。配置変更と契約・キャッシュ方針などの仕様変更を同じ PR に混ぜない。

| 単位                 | 変更範囲                                                  | 維持する境界                                                               | 確認                                                          |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ルート・layout       | `app/`、`components/layouts/`、import                     | URL、RequireSession、ユーザー別 Provider の順序                            | lint・型・build と focus／認証・遷移の browser scenario       |
| 1 Feature の通信・型 | `features/{domain}/{api,queries,types}/` と利用側 import  | HTTP パス・method・入出力、Query key、skipToken・AbortSignal、invalidation | lint・型・Query テスト、API 本体の差分、Server State scenario |
| 1画面の入力・表示    | Feature の `hooks/`・`components/`・`utils/` と対応 route | 入力保持・初期化、プリセット、検証、確認操作、成功後の遷移                 | 純粋関数と DOM のテスト、対象フローと focus                   |
| テスト・運用         | テスト設定・spec・文書、CI は別 PR                        | 実 API と固定レスポンスの境界、fixture 隔離、失敗時の診断                  | テスト検出、対象 scenario の実行、CI の成功／失敗経路         |

各実装 PR は対応 Issue と先行 PR、上記のどの単位か、実行した検証と未実施の範囲を記載する。各単位で format／lint／typecheck／test／build を通し、変更対象の主要導線を確認する。過去 PR の検証は各 PR 本文の記録であり、今回の再実行とは区別する。

## 今回の移行結果の照合

- #175 着手時の69ファイルについて、移行表の元パスが当時の Git tree と一致することを確認する。
- 表の移行先と追加ファイル一覧が存在し、旧パスが移行先と異なる場合は旧ファイルが残っていないことを確認する。
- #179 で追加した8ファイルを追補し、現在の `apps/web/src` 全99ファイルを漏れなく対応付ける。
- ESLint の配置・Feature 間依存・命名・直接 import 規則と、その回帰テストを実行する。
- #175 完了時の `6f581ed` と現在の `7f06637` を比較し、API 関数、型、Query Options／Mutation、HTTP／認証基盤、ルート定義に差分がないことを確認する。変更は配分・財布の UI 分離と検証の追加に限定される。

#135 の export 名は配置違反とは区別する。lint の成功をもって全ドメイン用語の統一や API 契約共有まで完了したとは扱わない。

## 棚卸しの再実行

リポジトリルートで以下を実行する（Python 3 を使用）。移行元は #175 の実装直前、移行先は現在の checkout と照合する。将来ファイルが増えた場合は、移行表へ追補してから再実行する。

```sh
python3 - <<'PY'
from pathlib import Path
import re
import subprocess

root = Path("apps/web/src")
text = Path("docs/architecture/frontend-file-migration.md").read_text()
rows = [line.split("|")[1:3] for line in text.splitlines() if line.startswith("| `")]
sources, destinations = set(), set()
for before, after in rows:
    source = re.findall(r"`([^`]+)`", before)[0]
    targets = re.findall(r"`([^`]+)`", after)
    sources.add(source)
    destinations.update(targets)
    assert source in targets or not (root / source).exists(), source
destinations.update(re.findall(r"^- `([^`]+)`", text, re.M))
original = {
    path.removeprefix("apps/web/src/")
    for path in subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", "a5e9c7d^", "apps/web/src"], text=True
    ).splitlines()
}
actual = {str(path.relative_to(root)) for path in root.rglob("*") if path.is_file()}
assert sources == original, (sources - original, original - sources)
assert destinations == actual, (destinations - actual, actual - destinations)
print(f"移行元 {len(sources)} / 移行先 {len(actual)} ファイル一致、旧パス残存なし")
PY
```

API・型・Query／Mutation・認証などの維持は、上記基準コミット間の `git diff 6f581ed 7f06637 -- apps/web/src` で確認する。今後の変更は該当 PR の base と head へ置き換え、UI 以外の仕様変更が混在していないか読む。主要導線は次節の各コマンドで再実行する。

## 検証結果

2026-10-14 に上記基準コミットの実装に対して再実行した結果。文書はこの PR の内容を対象とする。

| 検証                                                             | 結果                                                         | 保証する範囲                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 移行表と Git tree／実ファイルの照合                              | 元69ファイル一致、移行先99ファイル一致、欠落・旧パス残存なし | 配置の移行漏れ。設計判断そのものは設計文書とレビューで確認                                       |
| `pnpm format:check`                                              | 成功                                                         | リポジトリ全体の整形                                                                             |
| `pnpm --filter web lint`                                         | 成功                                                         | 実装・テストの命名、配置、依存方向                                                               |
| `pnpm --filter web typecheck`                                    | 成功                                                         | Web・テスト・設定の型整合                                                                        |
| `pnpm --filter web test`                                         | 8ファイル・153件成功                                         | 配分計算・DOM 接続、出金検証、Query 方針、lint 規則など                                          |
| `pnpm --filter web build`                                        | 成功                                                         | Web の production build                                                                          |
| `pnpm verify:server-state`                                       | 20件成功                                                     | 固定 API でキャッシュ共有、作成・削除・配分・請求・精算、retry、401、ログアウト、キャンセル、404 |
| `pnpm verify:focus`                                              | 3件成功                                                      | ログイン・財布・配分・出金などのキーボード操作とフォーカス表示                                   |
| `pnpm exec playwright test --config playwright.config.ts --list` | 4 scenario 検出                                              | 実 Backend 用の scripts／spec／config の対応。実行成功を保証しない                               |
| 文書内の相対リンク・記載ファイルの存在                           | 成功                                                         | 関連資料への到達性                                                                               |

実 Backend・Neon DB を使う4つの `pnpm verify:*` は今回実行していない。#174 の記録でも実 DB 結合は未確認であり、#116 の完了扱いにはしない。実行環境を整えて [ローカル検証手順](local-verification.md) に従い、seed から各コマンドを直列実行する。

## 次の作業候補

2026-10-14 の Issue 状態を基準とする。以下の実装は #176 の構成検証には混ぜない。

| 推奨順 | Issue                                                    | 次の単位・対象                                                                | 完了判定                                                                                                  |
| ------ | -------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1      | [#116](https://github.com/mda38/kaesune/issues/116) open | 検証専用 DB／設定を準備し、既存4つの feature verification を実 Backend で実行 | seed・画面操作・再読込・異常系が成功し、実行結果と artifact を記録。失敗なら該当 scenario／fixture を修正 |
| 2      | [#138](https://github.com/mda38/kaesune/issues/138) open | `turbo.json` の test task と `.github/workflows/ci.yml` の affected test      | Unit・Component の失敗で CI が失敗し、対象外 package を不要に実行しない。Browser は含めない               |
| 3      | [#135](https://github.com/mda38/kaesune/issues/135) open | withdrawal dialog の export／handle と Home の利用を Withdrawal に統一        | 同一概念の Payment／Withdrawal 混在を解消し、出金・focus 検証が成功                                       |
| 4      | [#130](https://github.com/mda38/kaesune/issues/130) open | `lib/api-client.ts` の JSON／204／非JSON／エラー形状と単体テスト              | 応答処理・失敗時の挙動が明確。401・AbortSignal を維持                                                     |
| 5      | [#127](https://github.com/mda38/kaesune/issues/127) open | Backend を正本とした API 入出力契約の共有                                     | 主要 request／response の重複を解消し、契約不整合を検出。配置移動とは別 PR                                |

#138・#135 は #116 の外部環境準備中にも独立して進められる。#128・#129 の金額／日付 utility、#126 の状態表示を変更する際は [テストマトリクス](../testing/frontend.md) の不足を同じ変更で補う。#177 は今回の戦略文書で設計を完了し、各実装は既存 Issue が所有する。
