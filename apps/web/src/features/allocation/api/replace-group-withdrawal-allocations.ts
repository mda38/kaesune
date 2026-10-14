import { put } from "@/lib/api-client";
import type { Withdrawal } from "@/features/withdrawal/types/withdrawal";
import type { AllocationInput } from "@/features/allocation/types/allocation";
export const replaceGroupWithdrawalAllocations = (
  groupId: string,
  withdrawalId: string,
  allocations: AllocationInput[],
) => {
  return put<Withdrawal>(
    `/api/groups/${groupId}/withdrawals/${withdrawalId}/allocations`,
    { allocations },
  );
};
