import { expect, test, type Page } from "@playwright/test";
import type { ClaimListItem } from "../apps/web/src/features/claim/types";
import type { Wallet } from "../apps/web/src/features/wallet/types";
import type { Withdrawal } from "../apps/web/src/features/withdrawal/types";

const timestamp = "2026-10-08T00:00:00.000Z";
const wallet: Wallet = {
  id: "wallet-1",
  groupId: "group-1",
  name: "共有財布",
  ownerType: "shared",
  ownerMemberId: null,
  createdAt: timestamp,
  updatedAt: timestamp,
};
const withdrawal: Withdrawal = {
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
const claim: ClaimListItem = {
  id: "claim-1",
  groupId: "group-1",
  debtorMemberId: "member-1",
  walletId: wallet.id,
  debtorMemberName: "検証ユーザー",
  walletName: wallet.name,
  amount: "1000",
  status: "unsettled",
  settledAt: null,
  createdAt: timestamp,
  updatedAt: timestamp,
  items: [
    {
      withdrawalId: withdrawal.id,
      purpose: withdrawal.purpose,
      amount: "1000",
    },
  ],
};

async function mockApi(page: Page) {
  const state = {
    userId: "user-1",
    authenticated: true,
    wallets: [structuredClone(wallet)],
    withdrawals: [structuredClone(withdrawal)],
    claims: [structuredClone(claim)],
    claimStatus: 200,
    claimCreateStatus: 200,
    mutationStatus: 200,
    delayClaims: null as Promise<void> | null,
    calls: new Map<string, number>(),
  };
  await page.route("http://localhost:8787/api/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname;
    const key = `${method} ${path}`;
    const headers = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    };
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    state.calls.set(key, (state.calls.get(key) ?? 0) + 1);
    const respond = (json: unknown, status = 200) =>
      route.fulfill({ json, status, headers });
    const user = {
      id: state.userId,
      name: "検証ユーザー",
      email: "test@example.test",
      emailVerified: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    if (path === "/api/auth/get-session") {
      await respond(
        state.authenticated
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
          : null,
      );
      return;
    }
    if (path === "/api/auth/sign-out") {
      state.authenticated = false;
      await respond({ success: true });
      return;
    }
    if (path === "/api/auth/sign-in/email") {
      state.authenticated = true;
      await respond({ user, token: "test-token", redirect: false });
      return;
    }
    if (path === "/api/me") {
      await respond({
        ...user,
        groups: [{ id: "group-1", name: "検証グループ", memberId: "member-1" }],
      });
      return;
    }
    if (path.endsWith("/members")) {
      await respond({
        members: [
          { id: "member-1", name: user.name, role: "owner", avatarUrl: null },
        ],
      });
      return;
    }
    if (method === "GET" && path.endsWith("/wallets")) {
      await respond({ wallets: state.wallets });
      return;
    }
    if (method === "GET" && path.endsWith("/withdrawals")) {
      await respond({ withdrawals: state.withdrawals });
      return;
    }
    if (method === "GET" && path === "/api/groups/group-1/claims") {
      if (state.delayClaims) await state.delayClaims;
      await respond(
        state.claimStatus === 200
          ? { claims: state.claims }
          : { message: "請求の取得エラー" },
        state.claimStatus,
      );
      return;
    }
    if (method === "GET" && /\/(claims|withdrawals)\/[^/]+$/.test(path)) {
      const items = path.includes("/claims/")
        ? state.claims
        : state.withdrawals;
      const item = items.find((item) => path.endsWith(`/${item.id}`));
      await respond(item ?? { message: "見つかりません" }, item ? 200 : 404);
      return;
    }
    if (state.mutationStatus !== 200) {
      await respond({ message: "更新エラー" }, state.mutationStatus);
      return;
    }
    if (method === "POST" && path.endsWith("/wallets")) {
      const created = { ...wallet, ...request.postDataJSON(), id: "wallet-2" };
      state.wallets.push(created);
      await respond(created, 201);
      return;
    }
    if (method === "DELETE" && path.includes("/wallets/")) {
      state.wallets = state.wallets.filter(
        (item) => !path.endsWith(`/${item.id}`),
      );
      await route.fulfill({ status: 204, headers });
      return;
    }
    if (method === "POST" && path.endsWith("/withdrawals")) {
      const created = {
        ...withdrawal,
        ...request.postDataJSON(),
        id: "withdrawal-2",
      };
      state.withdrawals.push(created);
      await respond(created, 201);
      return;
    }
    if (method === "DELETE" && path.includes("/withdrawals/")) {
      state.withdrawals = state.withdrawals.filter(
        (item) => !path.endsWith(`/${item.id}`),
      );
      await route.fulfill({ status: 204, headers });
      return;
    }
    if (method === "PUT" && path.endsWith("/allocations")) {
      state.withdrawals[0] = {
        ...state.withdrawals[0],
        allocations: request.postDataJSON().allocations,
        status: "allocated",
      };
      await respond(state.withdrawals[0]);
      return;
    }
    if (method === "POST" && path.endsWith("/claims")) {
      if (state.claimCreateStatus !== 200) {
        await respond({ message: "請求発行エラー" }, state.claimCreateStatus);
        return;
      }
      state.withdrawals[0].status = "claimed";
      state.claims = [{ ...claim, id: "claim-2" }];
      await respond({ claims: state.claims }, 201);
      return;
    }
    if (method === "PATCH" && path.includes("/claims/")) {
      state.claims[0].status = request.postDataJSON().status;
      state.withdrawals[0].status =
        state.claims[0].status === "settled" ? "settled" : "claimed";
      await respond(state.claims[0]);
      return;
    }
    if (method === "DELETE" && path.includes("/claims/")) {
      state.claims = [];
      state.withdrawals[0].status = "allocated";
      await route.fulfill({ status: 204, headers });
      return;
    }
    await respond({ message: `未定義の API: ${key}` }, 404);
  });
  return state;
}

const claimsPath = "GET /api/groups/group-1/claims";
const navigate = (page: Page, path: string) =>
  page.locator(`a[href="${path}"]`).first().click();

async function makeStaleAndRefetch(page: Page) {
  await page.clock.setFixedTime(
    new Date(await page.evaluate(() => Date.now() + 31_000)),
  );
  await page.evaluate(() =>
    window.dispatchEvent(new Event("visibilitychange")),
  );
}

test("Home・一覧・詳細は同じ請求キャッシュを共有し、精算後は各画面を更新する", async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto("/home");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  const before = state.calls.get(claimsPath);
  await navigate(page, "/invoices");
  await page.getByText("検証ユーザーさんへの請求", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "検証ユーザーさんへの請求" }),
  ).toBeVisible();
  expect(state.calls.get(claimsPath)).toBe(before);
  expect(
    state.calls.get("GET /api/groups/group-1/claims/claim-1"),
  ).toBeUndefined();
  await page.getByRole("checkbox").click();
  await expect(
    page.getByText("精算が完了しました", { exact: true }),
  ).toBeVisible();
  await navigate(page, "/home");
  await expect(page.getByText("¥0", { exact: true })).toBeVisible();
  await navigate(page, "/records");
  expect(state.withdrawals[0].status).toBe("settled");
});

test("財布の追加・削除を出金フォームでも反映する", async ({ page }) => {
  await mockApi(page);
  await page.goto("/wallets");
  await page.getByLabel("財布名").fill("旅行財布");
  await page.getByRole("button", { name: "財布を追加", exact: true }).click();
  await expect(page.getByText("旅行財布", { exact: true })).toBeVisible();
  await navigate(page, "/home");
  await page.getByRole("button", { name: "立て替えたお金を記録する" }).click();
  await expect(
    page.getByRole("combobox").locator("option", { hasText: "旅行財布" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "記録をやめる" }).click();
  await navigate(page, "/mypage");
  await navigate(page, "/wallets");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "旅行財布を削除" }).click();
  await expect(page.getByText("旅行財布", { exact: true })).toHaveCount(0);
  await navigate(page, "/home");
  await page.getByRole("button", { name: "立て替えたお金を記録する" }).click();
  await expect(
    page.getByRole("combobox").locator("option", { hasText: "旅行財布" }),
  ).toHaveCount(0);
});

test("出金の作成・削除後に一覧キャッシュを更新する", async ({ page }) => {
  await mockApi(page);
  await page.goto("/records");
  await expect(page.getByRole("link", { name: /駐車場/ })).toBeVisible();
  await navigate(page, "/home");
  await page.getByRole("button", { name: "立て替えたお金を記録する" }).click();
  await expect(page.getByLabel("金額", { exact: true })).toBeFocused();
  await page.getByLabel("金額", { exact: true }).fill("2500");
  await page.getByRole("combobox").selectOption("wallet-1");
  await page.getByPlaceholder("何に使いましたか？").fill("夕食");
  await page
    .getByRole("button", { name: "出金を記録する", exact: true })
    .click();
  await expect(page).toHaveURL(/\/records$/);
  await page.getByRole("link", { name: /夕食/ }).click();
  await page.getByRole("button", { name: "操作メニューを開く" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "削除する", exact: true }).click();
  await expect(page).toHaveURL(/\/records$/);
  await expect(page.getByRole("link", { name: /夕食/ })).toHaveCount(0);
});

test("配分保存・請求発行後に事前取得済みの請求一覧を更新する", async ({
  page,
}) => {
  const state = await mockApi(page);
  state.claims = [];
  await page.goto("/invoices");
  await expect(
    page.getByText("まだ請求はありません。", { exact: true }),
  ).toBeVisible();
  await navigate(page, "/records");
  await page.getByRole("link", { name: /駐車場/ }).click();
  await page.getByRole("link", { name: "請求を発行する" }).click();
  await page.getByRole("button", { name: /請求を発行/ }).click();
  await expect(page).toHaveURL(/\/invoices$/);
  await expect(
    page.getByText("検証ユーザーさんへの請求", { exact: true }),
  ).toBeVisible();
  expect(state.withdrawals[0].status).toBe("claimed");
});

test("stale な背景再取得で失敗しても金額を保持し、手動再試行できる", async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto("/home");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  const before = state.calls.get(claimsPath) ?? 0;
  state.claimStatus = 403;
  await makeStaleAndRefetch(page);
  await expect(
    page.getByRole("alert").filter({ hasText: "請求の取得エラー" }),
  ).toBeVisible();
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  expect(state.calls.get(claimsPath)).toBe(before + 1);
  state.claimStatus = 200;
  state.claims = [];
  await page.getByRole("button", { name: "再試行", exact: true }).click();
  await expect(page.getByText("¥0", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("出金フォームは閉じると入力を初期化し、API失敗時には入力を保持する", async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto("/home");
  const open = page.getByRole("button", { name: "立て替えたお金を記録する" });
  await open.click();
  await page.getByLabel("金額", { exact: true }).fill("2500");
  await page.getByRole("combobox").selectOption("wallet-1");
  await page.getByPlaceholder("何に使いましたか？").fill("  夕食  ");
  state.mutationStatus = 503;
  await page
    .getByRole("button", { name: "出金を記録する", exact: true })
    .click();
  await expect(page.getByText("更新エラー", { exact: true })).toBeVisible();
  await expect(page.getByLabel("金額", { exact: true })).toHaveValue("2,500");
  await expect(page.getByPlaceholder("何に使いましたか？")).toHaveValue(
    "  夕食  ",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await open.click();
  await expect(page.getByLabel("金額", { exact: true })).toBeFocused();
  await expect(page.getByLabel("金額", { exact: true })).toHaveValue("");
  await expect(page.getByRole("combobox")).toHaveValue("");
  await expect(page.getByPlaceholder("何に使いましたか？")).toHaveValue("");
  await expect(page.getByText("更新エラー", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "出金を記録する", exact: true }),
  ).toBeDisabled();
});

test("5xx は2回まで再試行してエラーを表示する", async ({ page }) => {
  const state = await mockApi(page);
  await page.goto("/home");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  const before = state.calls.get(claimsPath) ?? 0;
  state.claimStatus = 503;
  await makeStaleAndRefetch(page);
  await expect(page.getByRole("alert")).toBeVisible();
  expect(state.calls.get(claimsPath)).toBe(before + 3);
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
});

test("Mutation のエラーを表示し、自動再試行しない", async ({ page }) => {
  const state = await mockApi(page);
  await page.goto("/invoices/claim-1");
  state.mutationStatus = 503;
  await page.getByRole("checkbox").click();
  await expect(page.getByText("更新エラー", { exact: true })).toBeVisible();
  expect(state.calls.get("PATCH /api/groups/group-1/claims/claim-1")).toBe(1);
  expect(state.claims[0].status).toBe("unsettled");
});

test("401 はログインに戻し、再ログインでは以前のキャッシュを使わない", async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto("/home");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  state.claimStatus = 401;
  await makeStaleAndRefetch(page);
  await expect(
    page.getByText(
      "セッションの有効期限が切れました。再度ログインしてください。",
      { exact: true },
    ),
  ).toBeVisible();
  state.claimStatus = 200;
  state.claims = [];
  state.userId = "user-2";
  await page
    .getByLabel("ログイン ID（メールアドレス）")
    .fill("second@example.test");
  await page.getByLabel("パスワード", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText("¥0", { exact: true })).toBeVisible();
});

test("ログアウト後の別ユーザーには以前のキャッシュを表示しない", async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto("/home");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  await navigate(page, "/mypage");
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(
    page.getByRole("button", { name: "ログイン", exact: true }),
  ).toBeVisible();
  state.userId = "user-2";
  state.claims = [];
  await page
    .getByLabel("ログイン ID（メールアドレス）")
    .fill("second@example.test");
  await page.getByLabel("パスワード", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await expect(page.getByText("¥0", { exact: true })).toBeVisible();
});

test("画面を離れたら不要な取得をキャンセルする", async ({ page }) => {
  const state = await mockApi(page);
  let release!: () => void;
  state.delayClaims = new Promise<void>((resolve) => {
    release = resolve;
  });
  const request = page.waitForRequest((request) =>
    request.url().endsWith("/claims"),
  );
  await page.goto("/home");
  await request;
  const cancelled = page.waitForEvent("requestfailed", (request) =>
    request.url().endsWith("/claims"),
  );
  await navigate(page, "/mypage");
  await cancelled;
  release();
  state.delayClaims = null;
  state.claims = [];
  await navigate(page, "/home");
  await expect(page.getByText("¥0", { exact: true })).toBeVisible();
});

test("配分保存だけ成功した場合も出金を更新し、請求発行のエラーを表示する", async ({
  page,
}) => {
  const state = await mockApi(page);
  state.claims = [];
  state.claimCreateStatus = 409;
  await page.goto("/records/withdrawal-1/claims/new");
  await page
    .getByRole("button", { name: "請求を発行する", exact: true })
    .click();
  await expect(page.getByText("請求発行エラー", { exact: true })).toBeVisible();
  expect(state.withdrawals[0].status).toBe("allocated");
  expect(
    state.calls.get("GET /api/groups/group-1/withdrawals/withdrawal-1"),
  ).toBeGreaterThanOrEqual(2);
  expect(
    state.calls.get("POST /api/groups/group-1/withdrawals/withdrawal-1/claims"),
  ).toBe(1);
  state.claimCreateStatus = 200;
  await page
    .getByRole("button", { name: "請求を発行する", exact: true })
    .click();
  await expect(page).toHaveURL(/\/invoices$/);
  await expect(
    page.getByText("検証ユーザーさんへの請求", { exact: true }),
  ).toBeVisible();
});

test("請求削除後に Home と出金データを更新する", async ({ page }) => {
  const state = await mockApi(page);
  await page.goto("/home");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  await navigate(page, "/records");
  await expect(page.getByRole("link", { name: /駐車場/ })).toBeVisible();
  await navigate(page, "/invoices");
  await page.getByText("検証ユーザーさんへの請求", { exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "請求を削除する", exact: true })
    .click();
  await expect(
    page.getByText("まだ請求はありません。", { exact: true }),
  ).toBeVisible();
  await navigate(page, "/home");
  await expect(page.getByText("¥0", { exact: true })).toBeVisible();
  await navigate(page, "/records");
  await expect
    .poll(() => state.calls.get("GET /api/groups/group-1/withdrawals"))
    .toBe(2);
});

test("Mutation の401もログインへ戻す", async ({ page }) => {
  const state = await mockApi(page);
  await page.goto("/invoices/claim-1");
  state.mutationStatus = 401;
  await page.getByRole("checkbox").click();
  await expect(
    page.getByText(
      "セッションの有効期限が切れました。再度ログインしてください。",
      { exact: true },
    ),
  ).toBeVisible();
  expect(state.calls.get("PATCH /api/groups/group-1/claims/claim-1")).toBe(1);
});

for (const [path, message, apiPath] of [
  [
    "/records/missing",
    "指定された出金記録は見つかりませんでした。",
    "withdrawals/missing",
  ],
  [
    "/invoices/missing",
    "指定された請求は見つかりませんでした。",
    "claims/missing",
  ],
  [
    "/records/missing/claims/new",
    "指定された出金記録は見つかりませんでした。",
    "withdrawals/missing",
  ],
]) {
  test(`詳細の直接アクセスは全件取得せず404を表示: ${path}`, async ({
    page,
  }) => {
    const state = await mockApi(page);
    await page.goto(path);
    await expect(page.getByText(message, { exact: true })).toBeVisible();
    expect(state.calls.get(`GET /api/groups/group-1/${apiPath}`)).toBe(1);
    expect(state.calls.get(claimsPath)).toBeUndefined();
    expect(
      state.calls.get("GET /api/groups/group-1/withdrawals"),
    ).toBeUndefined();
  });
}
