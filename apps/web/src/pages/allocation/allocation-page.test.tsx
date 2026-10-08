// @vitest-environment jsdom

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AllocationPage } from "@/pages/allocation/allocation-page";
import { GroupContext } from "@/features/group/group-context";
import { groupQueries } from "@/features/group/queries";
import { withdrawalQueries } from "@/features/withdrawal/queries";
import { walletQueries } from "@/features/wallet/queries";
import type { GroupMember } from "@/features/group/types";
import type { Wallet } from "@/features/wallet/types";
import type { Withdrawal } from "@/features/withdrawal/types";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@/features/allocation/mutations", () => ({
  useCreateWithdrawalClaims: () => ({ mutate, isPending: false, error: null }),
}));

const members: GroupMember[] = [
  { id: "a", name: "花子", role: "owner", avatarUrl: null },
  { id: "b", name: "太郎", role: "member", avatarUrl: null },
  { id: "c", name: "次郎", role: "member", avatarUrl: null },
];
const withdrawal: Withdrawal = {
  id: "withdrawal",
  groupId: "group",
  walletId: "wallet",
  purpose: "食事",
  amount: "1000",
  withdrawnOn: "2026-10-08",
  note: null,
  status: "unallocated",
  createdAt: "",
  updatedAt: "",
  allocations: [],
};

const renderPage = (ownerType: Wallet["ownerType"] = "shared") => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(groupQueries.members("group").queryKey, members);
  client.setQueryData(withdrawalQueries.list("group").queryKey, [withdrawal]);
  client.setQueryData(walletQueries.list("group").queryKey, [
    {
      id: "wallet",
      groupId: "group",
      name: "食費財布",
      ownerType,
      ownerMemberId: ownerType === "personal" ? "a" : null,
      createdAt: "",
      updatedAt: "",
    } satisfies Wallet,
  ]);
  return render(
    <QueryClientProvider client={client}>
      <GroupContext.Provider
        value={{
          currentGroup: { id: "group", name: "家族", memberId: "a" },
          currentUser: null,
          errorMessage: null,
          isLoading: false,
          refresh: async () => {},
        }}
      >
        <MemoryRouter initialEntries={["/allocation/withdrawal"]}>
          <Routes>
            <Route
              path="/allocation/:withdrawalId"
              element={<AllocationPage />}
            />
            <Route path="/invoices" element={<p>請求一覧</p>} />
          </Routes>
        </MemoryRouter>
      </GroupContext.Provider>
    </QueryClientProvider>,
  );
};
const amountInput = (name: string) =>
  screen.getByRole("textbox", { name: `${name}の負担額` });
const issueButton = () =>
  screen.getByRole("button", { name: "請求を発行する" });
const summary = () =>
  screen.getByText("負担額の合計").parentElement!.parentElement!;

beforeEach(() => {
  mutate.mockReset();
});

describe("AllocationPage の金額ロジック接続", () => {
  it("均等配分を表示し、全額プリセットから均等配分に戻せる", () => {
    renderPage();
    expect(amountInput("花子")).toHaveValue("334");
    expect(amountInput("太郎")).toHaveValue("333");
    expect(amountInput("次郎")).toHaveValue("333");
    expect(
      screen.getByRole("button", { name: "＝ 均等にする" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(summary()).getByText("¥1,000")).toBeInTheDocument();
    expect(within(summary()).getByText(/残り\s+¥0/)).toBeInTheDocument();
    expect(screen.getAllByText(/を請求$/)).toHaveLength(3);
    expect(issueButton()).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "太郎が全額" }));
    expect(amountInput("花子")).toHaveValue("0");
    expect(amountInput("太郎")).toHaveValue("1000");
    expect(amountInput("次郎")).toHaveValue("0");
    expect(screen.getByText("太郎に ¥1,000 を請求")).toBeInTheDocument();
    expect(screen.getAllByText(/を請求$/)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "＝ 均等にする" }));
    expect(amountInput("花子")).toHaveValue("334");
    expect(screen.getAllByText(/を請求$/)).toHaveLength(3);
  });

  it("手入力で合計・残額・プレビュー・発行可否を更新する", () => {
    renderPage();
    fireEvent.change(amountInput("花子"), { target: { value: "" } });
    expect(amountInput("花子")).toHaveValue("");
    expect(within(summary()).getByText("入力してください")).toBeInTheDocument();
    expect(within(summary()).getByText(/残り\s+—/)).toBeInTheDocument();
    expect(issueButton()).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "＝ 均等にする" }),
    ).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(amountInput("花子"), { target: { value: "01" } });
    expect(amountInput("花子")).toHaveValue("01");
    expect(issueButton()).toBeDisabled();
    fireEvent.change(amountInput("花子"), { target: { value: "-1" } });
    expect(amountInput("花子")).toHaveValue("01");

    fireEvent.change(amountInput("花子"), { target: { value: "300" } });
    expect(within(summary()).getByText("¥966")).toBeInTheDocument();
    expect(within(summary()).getByText(/残り\s+¥34/)).toBeInTheDocument();
    expect(screen.getByText("花子に ¥300 を請求")).toBeInTheDocument();
    expect(issueButton()).toBeDisabled();
    fireEvent.change(amountInput("花子"), { target: { value: "400" } });
    expect(within(summary()).getByText(/残り\s+¥-66/)).toBeInTheDocument();
    expect(issueButton()).toBeDisabled();
    fireEvent.change(amountInput("花子"), { target: { value: "334" } });
    expect(issueButton()).toBeEnabled();
  });

  it("personal の財布では所有者をプレビューから除き、所有者のみの負担では発行不可にする", () => {
    renderPage("personal");
    expect(screen.queryByText("花子に ¥334 を請求")).not.toBeInTheDocument();
    expect(screen.getAllByText(/を請求$/)).toHaveLength(2);
    expect(issueButton()).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "花子が全額" }));
    expect(
      screen.getByText("この配分から発行される請求はありません。"),
    ).toBeInTheDocument();
    expect(issueButton()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "太郎が全額" }));
    expect(screen.getByText("太郎に ¥1,000 を請求")).toBeInTheDocument();
    expect(issueButton()).toBeEnabled();
  });

  it("表示中の配分を送信し、成功時に請求一覧へ遷移する", () => {
    renderPage("personal");
    fireEvent.change(amountInput("花子"), { target: { value: "200" } });
    fireEvent.change(amountInput("太郎"), { target: { value: "300" } });
    fireEvent.change(amountInput("次郎"), { target: { value: "500" } });
    fireEvent.click(issueButton());
    expect(mutate).toHaveBeenCalledExactlyOnceWith(
      {
        groupId: "group",
        withdrawalId: "withdrawal",
        allocations: [
          { memberId: "a", amount: "200" },
          { memberId: "b", amount: "300" },
          { memberId: "c", amount: "500" },
        ],
      },
      { onSuccess: expect.any(Function) },
    );
    // mutation の成功コールバックを通して、実際の Router 遷移を確認する。
    act(() => {
      mutate.mock.calls[0][1].onSuccess();
    });
    expect(screen.getByText("請求一覧")).toBeInTheDocument();
  });
});
