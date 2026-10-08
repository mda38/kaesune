# フロントエンドコーディング規約

`apps/web` を対象とする。規約は必要になったものだけ、運用しながら追加する。

## 基本方針

機械的に判定できる規約は、Prettier・ESLint などによる強制を最優先とする。
規約を決めた後、静的解析で検査できる項目を設定する。
以下の規約は ESLint で検査し、違反はエラーにする。

## ファイル名

コンポーネント・hook・その他のファイルを含め、基本的にすべて `kebab-case` に統一する。
ファイル名の付け方に迷う余地を減らすため、用途によって命名形式を変えない。
ツールが名前を指定するファイルは、その指定に従う。

- コンポーネント: `wallets-page.tsx`
- hook: `use-group-context.ts`
- その他: `api-client.ts`

コード内のコンポーネント名は `PascalCase`、関数・hook 名は `camelCase` とする。

## import パス

アプリ内の import・再 export は `@/`（`apps/web/src`）からのパスに統一し、`./`・`../` は使わない。
外部パッケージはパッケージ名で import する。

## コンポーネントの配置

1ファイルに定義するコンポーネントは1つまでとする。非公開の補助コンポーネントも別ファイルに分ける。
`index.ts` などによる再 export の集約は行わず、コンポーネントの定義ファイルから直接 import する。

## Props

Props は同じファイルに `type Props` として定義し、コンポーネントの引数に適用する。
引数にオブジェクト型を直接記載しない。Props を持たないコンポーネントに空の型定義は不要。

## 関数の宣言

宣言の形から役割が分かるように、次の形式に統一する。
ESLint では PascalCase の関数名をコンポーネントとして判別する。

- コンポーネントは `function Xxx() {}` を使う。
- その他の関数・hook は `const xxx = () => {}` を使う。

```tsx
type Props = { title: string };

function WalletsPage({ title }: Props) {
  return <main>{title}</main>;
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString("ja-JP");
};

const useWallets = (groupId: string) => {
  return useQuery(walletQueries.list(groupId));
};
```
