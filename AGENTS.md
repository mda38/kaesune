# リポジトリ方針

## モノレポ

- `pnpm` workspaces と `Turborepo` を使用する。
- `apps/web` はフロントエンドアプリ。
- `apps/backend` はバックエンドアプリ。

## スコープ

- 指示された範囲以外は変更しない。
- 関係のないリファクタリングは避ける。
- 既存のアーキテクチャ、命名、フォルダ構成を優先する。

## Code Quality

- ローカル確認、Git Hooks、CI、テスト運用の詳細は [Development Docs](docs/development/index.md) を参照する。
- 仕様書・設計資料・開発ルールは `docs/` にまとめ、GitHub またはエディタで確認する。
- 環境変数を追加・変更・削除するときは、同じ変更で [環境変数の設定](docs/development/environment-variables.md)、対応する `*.example`、アプリごとの README を更新する。

## 文書言語

- 新規・更新する仕様書、設計資料、開発ルール、README、Plan、GitHub Issue、Pull Request 本文は、原則として日本語で記載する。
- API 名、コード、コマンド、固有名詞など、英語のままが明確なものは翻訳しない。
- 既存の英語文書を、今回の変更と無関係に翻訳しない。
