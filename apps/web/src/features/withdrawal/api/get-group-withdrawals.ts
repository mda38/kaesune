import { get } from "@/lib/api-client";
import type { Withdrawal } from "@/features/withdrawal/types/withdrawal";
export const getGroupWithdrawals = async (
  groupId: string,
  signal?: AbortSignal,
) => {
  const response = await get<{ withdrawals: Withdrawal[] }>(
    `/api/groups/${groupId}/withdrawals`,
    signal,
  );
  return response.withdrawals;
};
