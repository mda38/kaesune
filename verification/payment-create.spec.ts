import { expect, test } from "@playwright/test";
import { groupId, screenshot, signIn } from "./helpers/session";

test("出金登録後に記録一覧と再読み込みで保存内容を確認する", async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.goto("/home");
  await page.getByRole("button", { name: "立て替えたお金を記録する" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("金額", { exact: true })).toBeFocused();
  const today = await page.evaluate(() => {
    const date = new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);
  });
  await expect(dialog.getByLabel("日付（任意）")).toHaveValue(today);
  await dialog.getByLabel("金額", { exact: true }).fill("1234");
  await dialog
    .getByLabel("出金元の財布")
    .selectOption({ label: "E2E 出金作成用財布" });
  await dialog.getByLabel("用途", { exact: true }).fill("E2E 出金作成");
  await dialog.getByLabel("メモ（任意）").fill("E2E 保存確認");
  await screenshot(page, testInfo, "payment-create-form");
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith(`/api/groups/${groupId}/withdrawals`),
  );
  await dialog
    .getByRole("button", { name: "出金を記録する", exact: true })
    .click();
  expect((await saved).status()).toBe(201);
  await expect(page).toHaveURL("/records");
  await page.reload();
  const record = page.getByRole("link").filter({ hasText: "E2E 出金作成" });
  await expect(record).toContainText("¥1,234");
  await record.click();
  await expect(
    page.getByText("E2E 出金作成用財布", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(today.replaceAll("-", "/"), { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("E2E 保存確認", { exact: true })).toBeVisible();
  await page.goto("/records");
  await expect(record).toBeVisible();
  await screenshot(page, testInfo, "payment-create-after");
});
