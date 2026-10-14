import { post } from "@/lib/api-client";
import type { Claim } from "@/features/claim/types/claim";
export const createGroupWithdrawalClaims = (
  groupId: string,
  withdrawalId: string,
) => {
  return post<{ claims: Claim[] }>(
    `/api/groups/${groupId}/withdrawals/${withdrawalId}/claims`,
    {},
  );
};
