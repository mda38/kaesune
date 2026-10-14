import { ApiRequestError } from "@/lib/api-client";
import { get } from "@/lib/api-client";
import type { Withdrawal } from "@/features/withdrawal/types/withdrawal";
export const getGroupWithdrawal = async (
  groupId: string,
  withdrawalId: string,
  signal?: AbortSignal,
) => {
  try {
    return await get<Withdrawal>(
      `/api/groups/${groupId}/withdrawals/${withdrawalId}`,
      signal,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
};
