# Okaeshi ドキュメント

プロダクト仕様、設計資料、開発ルールを Markdown と Mermaid で管理します。GitHub またはエディタで閲覧・編集してください。ビルドやデプロイは行いません。

## プロダクト

- [デザインルール](product/design-system.md)
- [ドメインモデル](product/domain.md)
- [Flows and states](product/flows.md)
- [用語集](product/glossary.md)
- [立替・精算管理Webアプリ 仕様書](product/overview.md)
- [静的画面とルーティング](product/static-screen-routes.md)

## アーキテクチャ

- [API design](architecture/api.md)
- [すぐ使える、パスワード認証](architecture/authentication.md)
- [Database design](architecture/database.md)
- [System overview](architecture/overview.md)
- [Technology stack](architecture/technology-stack.md)

## 開発・運用

- [CI 品質ゲート](development/ci-quality-gate.md)
- [コード品質チェック運用](development/code-quality-checks.md)
- [ログインできるまでの設定マップ](development/environment-variables.md)
- [Development Docs](development/index.md)
- [ローカル検証手順](development/local-verification.md)
- [Planning Workflow](development/planning-workflow.md)
- [テスト運用](development/test-operations.md)

## 編集ルール

- 既存の分類に合わせて Markdown を追加し、この目次も更新する。
- 文書間のリンクは、拡張子 `.md` を含む相対パスで記載する。
- 図は `mermaid` コードブロックで記載し、GitHub または Mermaid 対応エディタで表示を確認する。
- 図を補足する説明や詳細な定義は、文章・表でも残す。
- 文書のタイトルと説明は本文に記載し、frontmatter は使用しない。
- 環境変数の変更時は、環境変数ガイド、対応する `*.example`、アプリごとの README を同時に更新する。
- `pnpm format:check` と既存の Git Hooks・CI で Markdown の整形を確認する。
