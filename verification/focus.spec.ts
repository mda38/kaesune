import { expect, test, type Page } from "@playwright/test";

const mockApi = async (page: Page) => {
  const state = { authenticated: true };
  const timestamp = "2026-10-08T00:00:00.000Z";
  const user = {
    id: "user-1",
    name: "検証ユーザー",
    email: "test@example.test",
    emailVerified: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const wallet = {
    id: "wallet-1",
    groupId: "group-1",
    name: "共有財布",
    ownerType: "shared",
    ownerMemberId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const withdrawal = {
    id: "withdrawal-1",
    groupId: "group-1",
    walletId: wallet.id,
    purpose: "駐車場",
    amount: "1000",
    withdrawnOn: "2026-10-08",
    note: null,
    status: "unallocated",
    allocations: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await page.route("http://localhost:8787/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const headers = {
      "Access-Control-Allow-Origin": "http://localhost:5174",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    let json: unknown;
    if (path === "/api/auth/get-session")
      json = state.authenticated
        ? {
            user,
            session: {
              id: "session-1",
              userId: user.id,
              token: "test-token",
              expiresAt: "2099-01-01T00:00:00.000Z",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          }
        : null;
    else if (path === "/api/me")
      json = {
        ...user,
        groups: [{ id: "group-1", name: "検証グループ", memberId: "member-1" }],
      };
    else if (path.endsWith("/members"))
      json = {
        members: [
          { id: "member-1", name: user.name, role: "owner", avatarUrl: null },
        ],
      };
    else if (path.endsWith("/wallets")) json = { wallets: [wallet] };
    else if (path.endsWith("/withdrawals"))
      json = { withdrawals: [withdrawal] };
    else if (path.endsWith("/withdrawals/withdrawal-1")) json = withdrawal;
    else if (path.endsWith("/claims")) json = { claims: [] };
    else throw new Error(`未定義のAPI: ${path}`);
    await route.fulfill({ json, headers });
  });
  return state;
};

const expectIndicator = async (page: Page) => {
  const active = page.locator(':focus, input[type="date"]:focus-within');
  await expect(active).toBeVisible();
  expect(
    await active.evaluate((element) =>
      element.matches(':focus-visible, input[type="date"]:focus-within'),
    ),
  ).toBe(true);
  await expect(active).toHaveCSS("outline-style", "solid");
  await expect(active).toHaveCSS("outline-width", "3px");
  await expect(active).toHaveCSS("outline-offset", "-3px");
};

test("主要画面のフォーム・ボタン・リンクへTabで移動するとフォーカスが見える", async ({
  page,
}) => {
  await mockApi(page);
  for (const path of [
    "/wallets",
    "/records/withdrawal-1/claims/new",
    "/home",
    "/mypage",
  ]) {
    await page.goto(path);
    await expect(page.locator("main").first()).toBeVisible();
    await page.getByRole("link").first().waitFor();
    const count = await page
      .locator(
        "a[href]:visible, button:enabled:visible, input:enabled:visible, select:enabled:visible, textarea:enabled:visible",
      )
      .count();
    for (let index = 0; index < count; index += 1) {
      await page.keyboard.press("Tab");
      await expectIndicator(page);
    }
  }
});

test("出金ダイアログをキーボードで開き全項目・キャンセルまで操作する", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/home");
  const open = page.getByRole("button", { name: "立て替えたお金を記録する" });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("金額", { exact: true })).toBeFocused();
  await expectIndicator(page);
  await page.keyboard.type("2500");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox")).toBeFocused();
  await expectIndicator(page);
  await page.getByRole("combobox").selectOption("wallet-1");
  await page.keyboard.press("Tab");
  await expect(page.getByPlaceholder("何に使いましたか？")).toBeFocused();
  await expectIndicator(page);
  await page.keyboard.type("夕食");
  // date input has multiple native keyboard segments; Tab through each.
  let reachedCancel = false;
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    await expectIndicator(page);
    if (
      await page
        .getByRole("button", { name: "キャンセル", exact: true })
        .evaluate((element) => element === document.activeElement)
    ) {
      reachedCancel = true;
      break;
    }
  }
  expect(reachedCancel).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("ログインフォームのキーボードフォーカスとマウス操作を確認する", async ({
  page,
}) => {
  const state = await mockApi(page);
  state.authenticated = false;
  await page.goto("/");
  await expect(page.getByLabel("ログイン ID（メールアドレス）")).toBeEnabled();
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press("Tab");
    await expectIndicator(page);
  }
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  expect(
    await page
      .getByRole("button", { name: "ログイン", exact: true })
      .evaluate((element) => element.matches(":focus-visible")),
  ).toBe(false);
});
