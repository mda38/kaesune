import { expect, type Page, type TestInfo } from "@playwright/test";
import { mkdir } from "node:fs/promises";

export const groupId = "de086a07-0c9c-4a2a-bf75-029c7d0df01d";

// Page と共有する request context で Cookie を受け取り、ログイン UI に依存しない。
export async function signIn(page: Page) {
  const response = await page.request.post(
    "http://localhost:8787/api/auth/sign-in/email",
    {
      headers: { Origin: "http://localhost:5173" },
      data: {
        email: process.env.VERIFY_USER_EMAIL,
        password: process.env.VERIFY_USER_PASSWORD,
      },
    },
  );
  expect(response.status(), "fixture ユーザーの API 認証").toBe(200);
}

export async function screenshot(page: Page, testInfo: TestInfo, name: string) {
  await mkdir("verification-artifacts", { recursive: true });
  const path = `verification-artifacts/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: "image/png" });
}
