# API design

業務APIはRESTの統一インターフェースで提供し、実装したルートからOpenAPI 3.0仕様を生成します。

## API reference

ローカルでBackendを起動後、[Swagger UI](http://localhost:8787/api/docs) で仕様の確認とAPI実行ができます。機械可読な仕様は [OpenAPI JSON](http://localhost:8787/api/openapi.json) から取得します。

## 認証と認可

認証はBetter Authが管理する`/api/auth/*`を維持します。この領域は標準ライブラリのセッションプロトコルであり、既存のログイン画面との互換性を保つため業務REST APIへ置き換えません。 業務APIはセッションcookieを必須とし、対象Groupのactive membershipを確認します。所属していないGroupのリソースは`404`を返します。

## REST規約

- URIは複数形の名詞で表し、Group配下の所有関係をURI階層にします。
- `GET`、`POST`、`PUT`、`PATCH`、`DELETE`をHTTPの意味に従って使用します。
- 金額は円単位の正整数文字列、IDはUUID、日時はISO 8601、日付は`YYYY-MM-DD`です。
- 金銭情報を含むレスポンスには`Cache-Control: no-store`を設定します。
- 未認証は`401`、存在しない・権限のないリソースは`404`、入力不備は`422`、状態競合は`409`で返します。

## 主要リソース

- `GET /api/me`: 現在のユーザーと所属Group
- `/api/groups/{groupId}/wallets`: 財布の取得・作成・更新・削除
- `/api/groups/{groupId}/withdrawals`: 出金の取得・作成・更新・削除
- `/api/groups/{groupId}/withdrawals/{withdrawalId}/allocations`: 負担額の置換
- `/api/groups/{groupId}/withdrawals/{withdrawalId}/claims`: 請求の作成
- `/api/groups/{groupId}/claims`: 請求の一覧・精算状態の更新
- `/api/groups/{groupId}/dashboard`: 未精算サマリーと最近のアクティビティ

## 整合性

負担額の合計は出金額と一致させ、個人財布は所有者以外の負担だけを請求し、共有財布は全負担を請求します。請求済みの負担や削除不可の財布は`409`で拒否します。関連する複数更新とActivity記録はNeonのbatch transactionでまとめます。
