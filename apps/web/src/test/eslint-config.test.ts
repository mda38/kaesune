import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint();

const messagesFor = async (code: string, filePath = "src/rule-check.tsx") => {
  const [result] = await eslint.lintText(code, { filePath });
  expect(result.fatalErrorCount).toBe(0);
  return result.messages;
};

describe("import パスの規約", () => {
  it.each([
    'import { value } from "./api";',
    'import { value } from "../../api";',
    'import type { Value } from "../types";',
    'import "./style.css";',
    'export { value } from "../api";',
    'export type { Value } from "../types";',
    'import { value } from "/src/api";',
  ])("相対パス・ルートからのパスを拒否する: %s", async (code) => {
    const messages = await messagesFor(code);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "no-restricted-imports",
          severity: 2,
        }),
      ]),
    );
  });

  it.each([
    'import { value } from "@/lib/api";',
    'export { value } from "@/lib/api";',
    'import "@/styles/index.css";',
    'import { useState } from "react";',
    'import { useQuery } from "@tanstack/react-query";',
  ])("エイリアス・外部パッケージを許可する: %s", async (code) => {
    const messages = await messagesFor(code);
    expect(
      messages.some((message) => message.ruleId === "no-restricted-imports"),
    ).toBe(false);
  });
});

describe("コンポーネントの配置規約", () => {
  it.each([
    ["export function View() { return null; }", "src/view.tsx", false],
    [
      'const format = () => ""; export function View() { return format(); }',
      "src/view.tsx",
      false,
    ],
    [
      "export function View() { return null; } function Helper() { return null; }",
      "src/view.tsx",
      true,
    ],
    [
      "export function View() { function Helper() { return null; } return <Helper />; }",
      "src/view.tsx",
      true,
    ],
    [
      "export const Dialog = forwardRef(function Dialog() { return null; });",
      "src/dialog.tsx",
      false,
    ],
    [
      "export function View() { return null; } const Dialog = forwardRef(function Dialog() { return null; });",
      "src/view.tsx",
      true,
    ],
    [
      "export const View = memo(function View() { return null; });",
      "src/view.tsx",
      false,
    ],
    [
      "export const View = memo(function View() { return null; }); const Other = React.memo(function Other() { return null; });",
      "src/view.tsx",
      true,
    ],
    [
      'export { View } from "@/view"; export { Other } from "@/other";',
      "src/index.ts",
      true,
    ],
    [
      'export { View } from "@/view"; export { Other } from "@/other";',
      "src/views.ts",
      true,
    ],
    ['export { View, Other } from "@/views";', "src/views.ts", true],
    [
      'export { default as View } from "@/view"; export { default as Other } from "@/other";',
      "src/views.ts",
      true,
    ],
    [
      "export function View() { return null; } export default memo(function Other() { return null; });",
      "src/view.tsx",
      true,
    ],
    [
      "export const View = memo(forwardRef(function View() { return null; }));",
      "src/view.tsx",
      false,
    ],
    [
      'export type { ViewProps, OtherProps } from "@/types";',
      "src/types.ts",
      false,
    ],
    [
      'export { type ViewProps, type OtherProps } from "@/types";',
      "src/types.ts",
      false,
    ],
    ["export function View() { return null; }", "src/index.tsx", true],
    ['import { View } from "@/view"; export { View };', "src/index.ts", true],
    ['export * from "@/views";', "src/index.ts", true],
    ['export { View } from "@/view";', "src/view-export.ts", true],
    ["export {};", "src/index.ts", true],
    ['export * from "@/views";', "src/views.ts", true],
    [
      "function View() { return null; } export { View };",
      "src/view.tsx",
      false,
    ],
    [
      "function View() { return null; } export { View as Alias };",
      "src/view.tsx",
      false,
    ],
  ])("配置の検査: %s (%s)", async (code, filePath, invalid) => {
    const messages = await messagesFor(code, filePath);
    expect(
      messages.some((message) => message.ruleId === "local/component-file"),
    ).toBe(invalid);
  });
});

describe("Props の規約", () => {
  it.each([
    ["export function View() { return null; }", false],
    [
      "type Props = { name: string }; export function View({ name }: Props) { return <p>{name}</p>; }",
      false,
    ],
    [
      "type Props = { name: string }; export function View(props: Props) { return <p>{props.name}</p>; }",
      false,
    ],
    [
      'type Props = { name: string }; export function View({ name }: Props = { name: "" }) { return <p>{name}</p>; }',
      false,
    ],
    [
      "type Props<T> = { value: T }; export function View<T>({ value }: Props<T>) { return <p>{String(value)}</p>; }",
      false,
    ],
    [
      "export function View({ name }: { name: string }) { return <p>{name}</p>; }",
      true,
    ],
    ["export function View(props) { return <p>{props.name}</p>; }", true],
    [
      "type ViewProps = { name: string }; export function View({ name }: ViewProps) { return <p>{name}</p>; }",
      true,
    ],
    [
      "interface Props { name: string } export function View({ name }: Props) { return <p>{name}</p>; }",
      true,
    ],
    [
      'import type { Props } from "@/types"; export function View({ name }: Props) { return <p>{name}</p>; }',
      true,
    ],
    [
      "export const Dialog = forwardRef<Handle>(function Dialog(_, ref) { return null; });",
      false,
    ],
    [
      "type Props = { name: string }; export const Dialog = forwardRef<Handle, Props>(function Dialog(props, ref) { return <p>{props.name}</p>; });",
      false,
    ],
    [
      "type Props = { name: string }; export const Dialog = forwardRef<Handle, Props>(function Dialog({ name }: Props, ref) { return <p>{name}</p>; });",
      false,
    ],
    [
      "export const Dialog = forwardRef<Handle, { name: string }>(function Dialog(props, ref) { return <p>{props.name}</p>; });",
      true,
    ],
    [
      "type Props = { name: string }; export const View = memo(function View({ name }: Props) { return <p>{name}</p>; });",
      false,
    ],
    [
      "export const View = memo(function View({ name }: { name: string }) { return <p>{name}</p>; });",
      true,
    ],
    ["const format = ({ name }: { name: string }) => name;", false],
  ])("Props の型定義を検査する: %s", async (code, invalid) => {
    const messages = await messagesFor(code);
    expect(
      messages.some((message) => message.ruleId === "local/component-props"),
    ).toBe(invalid);
  });
});
