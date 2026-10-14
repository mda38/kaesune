import { useState } from "react";
import type { GroupMember } from "@/features/group/types/group";
import type { Withdrawal } from "@/features/withdrawal/types/withdrawal";
import {
  buildAllocations,
  buildEqualAllocations,
  buildFullAmountAllocations,
  isAllocationAmountInput,
  type AllocationView,
} from "@/features/allocation/utils/allocations";

type AllocationOverride = {
  allocations: AllocationView[];
  selectedPreset: string | null;
  withdrawalId: string;
};

export const useAllocationForm = (
  withdrawal: Withdrawal,
  members: GroupMember[],
) => {
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
    applyEqualPreset,
    applyFullAmountPreset,
    updateAllocationAmount,
  };
};
