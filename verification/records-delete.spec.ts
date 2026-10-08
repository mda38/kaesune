import { expect, test } from "@playwright/test";
import { screenshot, signIn } from "./helpers/session";

test("未配分出金を削除し、配分済出金は削除操作を表示しない", async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.goto("/records/4d7c411a-c697-4dc2-88a9-7f070e93dfa6");
  await expect(page.getByText("E2E 配分済出金", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "操作メニューを開く" }).click();
  await expect(
    page.getByRole("button", { name: "削除する", exact: true }),
  ).toHaveCount(0);
  await page.goto("/records/4d7a43b0-cedd-40ee-949a-c450e6122881");
  await expect(page.getByText("E2E 未配分出金", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "操作メニューを開く" }).click();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("「E2E 未配分出金」を削除しますか？");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "削除する", exact: true }).click();
  await expect(page.getByText("E2E 未配分出金", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "操作メニューを開く" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "削除する", exact: true }).click();
  await expect(page).toHaveURL("/records");
  await page.reload();
  await expect(
    page.locator('a[href="/records/4d7a43b0-cedd-40ee-949a-c450e6122881"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('a[href="/records/4d7c411a-c697-4dc2-88a9-7f070e93dfa6"]'),
  ).toBeVisible();
  await screenshot(page, testInfo, "records-delete-after");
});
