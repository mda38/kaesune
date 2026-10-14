# CI 品質ゲート

変更の影響範囲を効率よく検証する CI 方針

## 目的

Pull Request 時に、変更の影響を受ける範囲だけを効率よく検証し、リポジトリ全体の品質を担保する。

## 方針

- `format` はリポジトリ全体を対象に検証する
- `lint` / `typecheck` / `build` は Turborepo の `--affected` を使って対象範囲を絞る
- Frontend の Unit／Component test は `test --affected --filter=web` で実行する。Backend の CI 接続は #157 で別途対応する。Browser／実 DB の検証は CI に含めない
- `test` は `turbo.json` に登録し、成果物を持たないため `outputs: []` とする。成功結果とログをキャッシュし、失敗結果は成功として再利用しない。入力・テスト変更時は新しい hash で実行する
- テスト運用の詳細は [テスト運用](test-operations.md) を参照する

## 実行内容

### format

- `pnpm format:check`

### Frontend test

- `pnpm exec turbo run test --affected --filter=web --cache-dir=.turbo`
- format の後に実行する。影響対象の Web だけで `vitest run` を実行し、非ゼロ終了なら品質ゲートを失敗させる
- テストの失敗を無視する設定や、テスト未検出を成功にする設定は追加しない
- 本 step が失敗した場合、後続の lint／typecheck／build は実行されない

### lint / typecheck / build

- `pnpm exec turbo run lint typecheck build --affected --continue=always --cache-dir=.turbo`

## 補足

- GitHub Actions 上では `--affected` が Pull Request の base branch を基準に差分を判定する
- Turborepo の cache を使うことで、入力に変更がない task の再実行を抑えられる
- `pre-commit` は軽量に保ち、重い確認は CI に寄せる

## ローカルで CI と同じ差分を確認する

CI は job の `TURBO_SCM_BASE`／`TURBO_SCM_HEAD` を全 affected step で共有する。PR は base SHA と GitHub の head SHA、develop push は変更前後の SHA を使う。ローカルは比較対象を明示する。

```sh
TURBO_SCM_BASE=origin/develop TURBO_SCM_HEAD=HEAD pnpm exec turbo run test --affected --filter=web --dry=json
TURBO_SCM_BASE=origin/develop TURBO_SCM_HEAD=HEAD pnpm exec turbo run test --affected --filter=web --cache-dir=.turbo
```

`--dry=json` の tasks で `web#test` の選択を確認する。Web とその依存に影響がない変更では実行しない。root の package・lockfile・Turbo 設定の変更など、全 package に影響する入力では Web の test も選択される。

失敗伝播を確認する場合は、一時的な失敗テストを Web の検出対象へ置き、上と同じコマンドが非ゼロ終了することを確認してから撤去する。成功状態へ戻して再実行し、失敗テストはコミットしない。CI 接続の変更時は PR の Quality Checks とログで実際の `web:test` 実行も確認する。

Package を指定した task の詳細は [Turborepo の実行方法](https://turborepo.dev/docs/crafting-your-repository/running-tasks) を参照する。
