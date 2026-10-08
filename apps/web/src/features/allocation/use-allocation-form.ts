import { useState } from "react";
import type { GroupMember } from "@/features/group/types";
import type { Withdrawal } from "@/features/withdrawal/types";
import type { Wallet } from "@/features/wallet/types";
import { useCreateWithdrawalClaims } from "@/features/allocation/mutations";
import {
  buildAllocations,
  buildEqualAllocations,
  buildFullAmountAllocations,
  isAllocationAmountInput,
  summarizeAllocations,
  type AllocationView,
} from "@/features/allocation/domain";
type AllocationOverride = {
  allocations: AllocationView[];
  selectedPreset: string | null;
  withdrawalId: string;
};

export const useAllocationForm = (
  withdrawal: Withdrawal,
  members: GroupMember[],
  wallet: Wallet,
  groupId: string,
  onCreated: () => void,
) => {
  const createMutation = useCreateWithdrawalClaims();
  const isCreatingClaims = createMutation.isPending;
  const claimCreateError = createMutation.error?.message ?? null;
  const [allocationOverride, setAllocationOverride] =
    useState<AllocationOverride | null>(null);

  const currentAllocationOverride =
    allocationOverride?.withdrawalId === withdrawal.id
      ? allocationOverride
      : null;
  const allocations =
    currentAllocationOverride?.allocations ??
    buildAllocations(withdrawal, members);
  const selectedPreset =
    currentAllocationOverride?.selectedPreset ??
    (currentAllocationOverride
      ? null
      : withdrawal.status === "unallocated"
        ? "equal"
        : null);
  const withdrawalAmount = BigInt(withdrawal.amount);
  const {
    hasValidAllocationAmounts,
    allocationTotal,
    remainingAmount,
    claimTargets,
    canCreateClaims,
  } = summarizeAllocations(withdrawalAmount, allocations, wallet);
  const createClaims = () => {
    if (!groupId || isCreatingClaims || !canCreateClaims) return;
    createMutation.mutate(
      {
        groupId,
        withdrawalId: withdrawal.id,
        allocations: allocations.map(({ member, amount }) => ({
          memberId: member.id,
          amount,
        })),
      },
      { onSuccess: () => onCreated() },
    );
  };

  const applyEqualPreset = () => {
    setAllocationOverride({
      allocations: buildEqualAllocations(withdrawal, members),
      selectedPreset: "equal",
      withdrawalId: withdrawal.id,
    });
  };

  const applyFullAmountPreset = (memberId: string) => {
    setAllocationOverride({
      allocations: buildFullAmountAllocations(withdrawal, members, memberId),
      selectedPreset: memberId,
      withdrawalId: withdrawal.id,
    });
  };

  const updateAllocationAmount = (memberId: string, amount: string) => {
    if (!isAllocationAmountInput(amount)) return;
    setAllocationOverride({
      allocations: allocations.map((allocation) =>
        allocation.member.id === memberId
          ? { ...allocation, amount }
          : allocation,
      ),
      selectedPreset: null,
      withdrawalId: withdrawal.id,
    });
  };

  return {
    allocations,
    selectedPreset,
    withdrawalAmount,
    hasValidAllocationAmounts,
    allocationTotal,
    remainingAmount,
    claimTargets,
    canCreateClaims,
    isCreatingClaims,
    claimCreateError,
    createClaims,
    applyEqualPreset,
    applyFullAmountPreset,
    updateAllocationAmount,
  };
};
