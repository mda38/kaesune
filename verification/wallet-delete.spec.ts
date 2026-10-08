import { expect, test } from "@playwright/test";
import { screenshot, signIn } from "./helpers/session";

test("未参照財布を削除し、参照中の財布は削除を拒否する", async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.goto("/wallets");
  await expect(
    page.getByText("E2E 削除可能財布", { exact: true }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "E2E 削除可能財布を削除", exact: true })
    .click();
  await expect(page.getByText("E2E 削除可能財布", { exact: true })).toHaveCount(
    0,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "E2E 参照中財布を削除", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText(
    "参照されている財布は削除できません。",
  );
  await expect(page.getByText("E2E 参照中財布", { exact: true })).toBeVisible();
  await screenshot(page, testInfo, "wallet-delete-after");
  await page.reload();
  await expect(page.getByText("E2E 削除可能財布", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("E2E 参照中財布", { exact: true })).toBeVisible();
});
