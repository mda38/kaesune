import type { GroupMember } from "@/features/group/types";
import type { Wallet } from "@/features/wallet/types";
import type { Withdrawal } from "@/features/withdrawal/types";

export type AllocationView = { member: GroupMember; amount: string };

export const buildAllocations = (
  withdrawal: Withdrawal,
  members: GroupMember[],
): AllocationView[] => {
  if (withdrawal.status === "unallocated") {
    return buildEqualAllocations(withdrawal, members);
  }
  const amountByMemberId = new Map(
    withdrawal.allocations.map(({ memberId, amount }) => [memberId, amount]),
  );
  return members.map((member) => ({
    member,
    amount: amountByMemberId.get(member.id) ?? "0",
  }));
};

export const buildEqualAllocations = (
  withdrawal: Pick<Withdrawal, "amount">,
  members: GroupMember[],
): AllocationView[] => {
  if (members.length === 0) return [];
  const total = BigInt(withdrawal.amount);
  const memberCount = BigInt(members.length);
  const baseAmount = total / memberCount;
  const remainder = total % memberCount;
  return members.map((member, index) => ({
    member,
    amount: (baseAmount + (BigInt(index) < remainder ? 1n : 0n)).toString(),
  }));
};

export const buildFullAmountAllocations = (
  withdrawal: Pick<Withdrawal, "amount">,
  members: GroupMember[],
  memberId: string,
): AllocationView[] => {
  const amount = BigInt(withdrawal.amount).toString();
  return members.map((member) => ({
    member,
    amount: member.id === memberId ? amount : "0",
  }));
};

// 編集中の空欄・先頭ゼロは保持し、発行時には確定値として別途検証する。
export const isAllocationAmountInput = (amount: string) => /^\d*$/.test(amount);

export const parseAllocationAmount = (amount: string) => {
  return /^(0|[1-9][0-9]*)$/.test(amount) ? BigInt(amount) : null;
};

export const summarizeAllocations = (
  withdrawalAmount: bigint,
  allocations: AllocationView[],
  wallet: Pick<Wallet, "ownerType" | "ownerMemberId"> | null,
) => {
  const parsed = allocations.map((allocation) => ({
    allocation,
    amount: parseAllocationAmount(allocation.amount),
  }));
  const hasValidAllocationAmounts = parsed.every(
    ({ amount }) => amount !== null,
  );
  const allocationTotal = parsed.reduce(
    (total, { amount }) => total + (amount ?? 0n),
    0n,
  );
  const remainingAmount = withdrawalAmount - allocationTotal;
  const claimTargets = parsed
    .filter(
      ({ allocation, amount }) =>
        (amount ?? 0n) > 0n &&
        (wallet?.ownerType === "shared" ||
          allocation.member.id !== wallet?.ownerMemberId),
    )
    .map(({ allocation }) => allocation);
  return {
    hasValidAllocationAmounts,
    allocationTotal,
    remainingAmount,
    claimTargets,
    canCreateClaims:
      hasValidAllocationAmounts &&
      remainingAmount === 0n &&
      claimTargets.length > 0,
  };
};
