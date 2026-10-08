import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

const componentFileRule = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      multiple: "コンポーネントは1ファイルに1つまでとしてください。",
      barrel:
        "コンポーネントは再 export せず、定義ファイルから直接 import してください。",
      index:
        "index ファイルは使わず、定義ファイルから直接 import してください。",
    },
  },
  create: (context) => {
    const isIndex = /(?:^|[/\\])index\.[jt]sx?$/.test(context.filename);
    const components = [];
    const isComponentName = (name) => /^[A-Z]/.test(name ?? "");

    return {
      Program: (node) => {
        if (isIndex) context.report({ node, messageId: "index" });
      },
      FunctionDeclaration: (node) => {
        if (isComponentName(node.id?.name)) components.push(node);
      },
      FunctionExpression: (node) => {
        if (!isComponentName(node.id?.name)) return;
        let owner = node.parent;
        while (owner.type === "CallExpression") owner = owner.parent;
        if (!components.includes(owner)) components.push(node);
      },
      VariableDeclarator: (node) => {
        if (!isComponentName(node.id.name)) return;
        const init = node.init;
        const isWrapper =
          init?.type === "CallExpression" &&
          ["memo", "forwardRef"].includes(
            init.callee.type === "Identifier"
              ? init.callee.name
              : init.callee.property?.name,
          );
        if (
          ["ArrowFunctionExpression", "FunctionExpression"].includes(
            init?.type,
          ) ||
          isWrapper
        ) {
          components.push(node);
        }
      },
      ExportNamedDeclaration: (node) => {
        if (!node.source || node.exportKind === "type") return;
        for (const specifier of node.specifiers) {
          if (
            specifier.exportKind !== "type" &&
            (isComponentName(specifier.local?.name) ||
              isComponentName(specifier.exported?.name))
          ) {
            context.report({ node: specifier, messageId: "barrel" });
          }
        }
      },
      ExportAllDeclaration: (node) => {
        if (node.exportKind !== "type") {
          context.report({ node, messageId: "barrel" });
        }
      },
      "Program:exit": () => {
        for (const component of components.slice(1)) {
          context.report({ node: component, messageId: "multiple" });
        }
      },
    };
  },
};

const componentPropsRule = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      props:
        "Props は同じファイルの type Props に定義し、引数の型に適用してください。",
    },
  },
  create: (context) => {
    const hasPropsType = context.sourceCode.ast.body.some((statement) => {
      const declaration = statement.declaration ?? statement;
      return (
        declaration.type === "TSTypeAliasDeclaration" &&
        declaration.id.name === "Props"
      );
    });
    const isProps = (type) =>
      type?.type === "TSTypeReference" && type.typeName.name === "Props";
    const check = (node) => {
      if (!/^[A-Z]/.test(node.id?.name ?? "") || !node.params.length) return;
      const parameter =
        node.params[0].type === "AssignmentPattern"
          ? node.params[0].left
          : node.params[0];
      const wrapper =
        node.parent.type === "CallExpression" ? node.parent : null;
      const wrapperName =
        wrapper?.callee.type === "Identifier"
          ? wrapper.callee.name
          : wrapper?.callee.property?.name;
      const inferredProps =
        wrapper?.typeArguments?.params[wrapperName === "forwardRef" ? 1 : 0];
      // Props を持たない forwardRef の未使用引数には空の型定義を要求しない。
      if (
        wrapperName === "forwardRef" &&
        parameter.name === "_" &&
        !parameter.typeAnnotation &&
        !inferredProps
      )
        return;
      if (
        !hasPropsType ||
        !isProps(parameter.typeAnnotation?.typeAnnotation ?? inferredProps)
      ) {
        context.report({ node: parameter, messageId: "props" });
      }
    };
    return { FunctionDeclaration: check, FunctionExpression: check };
  },
};

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { unicorn },
    rules: {
      "unicorn/filename-case": [
        "error",
        { case: "kebabCase", checkDirectories: false },
      ],
      // PascalCase の関数をコンポーネントとして扱う。
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration:not([id.name=/^[A-Z]/])",
          message: "関数・hook は const のアロー関数で宣言してください。",
        },
        {
          selector:
            "VariableDeclarator[id.name=/^[A-Z]/][init.type=/^(ArrowFunctionExpression|FunctionExpression)$/]",
          message: "コンポーネントは function 宣言を使ってください。",
        },
        {
          selector:
            "FunctionExpression:not([id.name=/^[A-Z]/]):not(MethodDefinition > FunctionExpression):not(Property[method=true] > FunctionExpression)",
          message: "関数・hook はアロー関数を使ってください。",
        },
        {
          selector:
            "VariableDeclarator:not([id.name=/^[A-Z]/])[init.type='FunctionExpression']",
          message: "関数・hook は const のアロー関数で宣言してください。",
        },
        {
          selector:
            "VariableDeclaration[kind!='const'] > VariableDeclarator[init.type='ArrowFunctionExpression']",
          message: "アロー関数は const で宣言してください。",
        },
        {
          selector: "ExportDefaultDeclaration > ArrowFunctionExpression",
          message:
            "関数・hook は名前を付けた const のアロー関数にしてください。コンポーネントは function 宣言を使ってください。",
        },
        {
          selector:
            "VariableDeclarator[id.name=/^[A-Z]/] > CallExpression:matches([callee.name=/^(memo|forwardRef)$/], [callee.object.name='React'][callee.property.name=/^(memo|forwardRef)$/]) > ArrowFunctionExpression",
          message: "コンポーネントは名前を付けた function を使ってください。",
        },
      ],
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      local: {
        rules: {
          "component-file": componentFileRule,
          "component-props": componentPropsRule,
        },
      },
    },
    rules: {
      "local/component-file": "error",
      "local/component-props": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:\\.{1,2}(?:/|$)|/)",
              message:
                "アプリ内の import・再 export は @/ からのパスを使ってください。",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
