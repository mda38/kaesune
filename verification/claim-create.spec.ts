import { expect, test } from "@playwright/test";
import { screenshot, signIn } from "./helpers/session";

test("負担配分を保存して請求を発行し、再読み込み後も請求内容を確認する", async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.goto("/records/b497aabe-1d9b-4de2-a05d-49c7e099ab6f");
  await expect(
    page.getByText("E2E 請求作成用出金", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "請求を発行する" }).click();
  await page
    .getByRole("button", { name: "E2E 請求作成対象が全額", exact: true })
    .click();
  await expect(page.getByLabel("E2E 請求作成対象の負担額")).toHaveValue("1000");
  await expect(
    page.getByText("E2E 請求作成対象に ¥1,000 を請求", { exact: true }),
  ).toBeVisible();
  await screenshot(page, testInfo, "claim-create-before");
  await page
    .getByRole("button", { name: "請求を発行する", exact: true })
    .click();
  await expect(page).toHaveURL("/invoices");
  await page.reload();
  const claim = page
    .getByRole("link")
    .filter({ hasText: "E2E 請求作成用出金" });
  await expect(claim).toHaveCount(1);
  await expect(claim).toContainText("E2E 請求作成対象さんへの請求");
  await expect(claim).toContainText("返済先: E2E 請求作成用共有財布");
  await expect(claim).toContainText("¥1,000");
  await expect(claim).toContainText("未精算");
  await screenshot(page, testInfo, "claim-create-after");
  await page.goto("/records/b497aabe-1d9b-4de2-a05d-49c7e099ab6f/claims/new");
  await expect(page.getByLabel("E2E 請求作成対象の負担額")).toHaveValue("1000");
});
