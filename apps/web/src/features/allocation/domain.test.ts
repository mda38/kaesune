import { describe, expect, it } from "vitest";
import {
  buildAllocations,
  buildEqualAllocations,
  buildFullAmountAllocations,
  isAllocationAmountInput,
  parseAllocationAmount,
  summarizeAllocations,
} from "@/features/allocation/domain";
import type { GroupMember } from "@/features/group/types";
import type { Withdrawal } from "@/features/withdrawal/types";

const members: GroupMember[] = ["a", "b", "c"].map((id) => ({
  id,
  name: id,
  role: "member",
  avatarUrl: null,
}));
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
const shared = { ownerType: "shared", ownerMemberId: null } as const;
const personal = { ownerType: "personal", ownerMemberId: "a" } as const;
const allocationsFor = (amounts: string[]) =>
  amounts.map((amount, index) => ({ member: members[index], amount }));

describe("配分生成", () => {
  it.each([
    ["1200", 3, ["400", "400", "400"]],
    ["1000", 3, ["334", "333", "333"]],
    ["1001", 3, ["334", "334", "333"]],
    ["1000", 1, ["1000"]],
    ["1000", 0, []],
    ["0", 3, ["0", "0", "0"]],
    ["2", 3, ["1", "1", "0"]],
    [
      "9007199254740994",
      3,
      ["3002399751580332", "3002399751580331", "3002399751580331"],
    ],
  ])("%s円を%s人に配分する", (amount, count, expected) => {
    const result = buildEqualAllocations({ amount }, members.slice(0, count));
    expect(result.map((item) => item.amount)).toEqual(expected);
    expect(result.map((item) => item.member)).toEqual(members.slice(0, count));
    if (count > 0) {
      expect(result.reduce((sum, item) => sum + BigInt(item.amount), 0n)).toBe(
        BigInt(amount),
      );
    }
  });

  it("未配分の場合は均等配分を初期値にする", () => {
    expect(
      buildAllocations(withdrawal, members).map(({ amount }) => amount),
    ).toEqual(["334", "333", "333"]);
    expect(buildAllocations(withdrawal, [])).toEqual([]);
  });

  it.each(["allocated", "claimed", "settled"] as const)(
    "%sの場合は現在のメンバー順で保存額を復元する",
    (status) => {
      expect(
        buildAllocations(
          {
            ...withdrawal,
            status,
            allocations: [
              { memberId: "c", amount: "700" },
              { memberId: "a", amount: "300" },
              { memberId: "removed", amount: "100" },
            ],
          },
          members,
        ),
      ).toEqual(allocationsFor(["300", "0", "700"]));
    },
  );

  it("指定されたメンバーだけに全額を割り当てる", () => {
    expect(buildFullAmountAllocations(withdrawal, members, "b")).toEqual(
      allocationsFor(["0", "1000", "0"]),
    );
  });
});

describe("入力と確定値の検証", () => {
  it.each(["0", "1", "1234", "9007199254740994"])(
    "%sは入力・確定値の両方で有効",
    (amount) => {
      expect(isAllocationAmountInput(amount)).toBe(true);
      expect(parseAllocationAmount(amount)).toBe(BigInt(amount));
    },
  );
  it.each(["", "00", "01"])("%sは編集可能だが確定値としては無効", (amount) => {
    expect(isAllocationAmountInput(amount)).toBe(true);
    expect(parseAllocationAmount(amount)).toBeNull();
  });
  it.each(["-1", "1.5", " 1", "1 ", " ", "abc", "１２", "+1", "1e3", "1,000"])(
    "%sは無効",
    (amount) => {
      expect(isAllocationAmountInput(amount)).toBe(false);
      expect(parseAllocationAmount(amount)).toBeNull();
    },
  );
});

describe("金額集計と請求対象", () => {
  it.each([
    [["334", "333", "333"], 1000n, 0n, true, true],
    [["300", "300", "300"], 900n, 100n, true, false],
    [["400", "400", "400"], 1200n, -200n, true, false],
    [["", "500", "500"], 1000n, 0n, false, false],
    [["01", "500", "500"], 1000n, 0n, false, false],
    [["invalid", "500", "500"], 1000n, 0n, false, false],
    [[], 0n, 1000n, true, false],
  ])("%jを集計する", (amounts, total, remaining, valid, canCreate) => {
    expect(
      summarizeAllocations(1000n, allocationsFor(amounts), shared),
    ).toMatchObject({
      allocationTotal: total,
      remainingAmount: remaining,
      hasValidAllocationAmounts: valid,
      canCreateClaims: canCreate,
    });
  });

  it("sharedは正額の全員、personalは所有者以外を対象にする", () => {
    const allocations = allocationsFor(["334", "333", "333"]);
    expect(
      summarizeAllocations(1000n, allocations, shared).claimTargets,
    ).toEqual(allocations);
    expect(
      summarizeAllocations(1000n, allocations, personal).claimTargets,
    ).toEqual(allocations.slice(1));
    expect(summarizeAllocations(1000n, allocations, null).claimTargets).toEqual(
      allocations,
    );
  });

  it("0と無効値を請求対象から除外する", () => {
    const allocations = allocationsFor(["0", "", "1000"]);
    expect(
      summarizeAllocations(1000n, allocations, shared).claimTargets,
    ).toEqual([allocations[2]]);
  });

  it("所有者だけが負担する場合は発行できない", () => {
    const allocations = allocationsFor(["1000", "0", "0"]);
    expect(summarizeAllocations(1000n, allocations, personal)).toMatchObject({
      claimTargets: [],
      canCreateClaims: false,
    });
    expect(
      summarizeAllocations(1000n, allocations, shared).canCreateClaims,
    ).toBe(true);
  });

  it.each([{ amounts: [] }, { amounts: ["0", "0", "0"] }])(
    "0円の配分%jは合計が一致しても発行できない",
    ({ amounts }) => {
      const result = summarizeAllocations(0n, allocationsFor(amounts), shared);
      expect(result).toMatchObject({
        allocationTotal: 0n,
        remainingAmount: 0n,
        claimTargets: [],
        canCreateClaims: false,
      });
    },
  );

  it("安全な整数の上限を超えても集計精度を維持する", () => {
    expect(
      summarizeAllocations(
        9007199254740994n,
        allocationsFor(["9007199254740993", "1", "0"]),
        shared,
      ),
    ).toMatchObject({
      allocationTotal: 9007199254740994n,
      remainingAmount: 0n,
      canCreateClaims: true,
    });
  });

  it("生成・集計で入力を書き換えない", () => {
    const allocations = allocationsFor(["334", "333", "333"]);
    const before = structuredClone({
      withdrawal,
      members,
      allocations,
      personal,
    });
    for (const member of members) Object.freeze(member);
    Object.freeze(members);
    Object.freeze(withdrawal.allocations);
    Object.freeze(withdrawal);
    for (const allocation of allocations) Object.freeze(allocation);
    Object.freeze(allocations);
    buildAllocations(withdrawal, members);
    buildEqualAllocations(withdrawal, members);
    buildFullAmountAllocations(withdrawal, members, "b");
    summarizeAllocations(1000n, allocations, personal);
    expect({ withdrawal, members, allocations, personal }).toEqual(before);
  });
});
