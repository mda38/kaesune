import { post, put } from "../../lib/api-client";
import type { Claim } from "../claim/types";
import type { Withdrawal } from "../withdrawal/types";

export type { Withdrawal } from "../withdrawal/types";

export type AllocationInput = { memberId: string; amount: string };

export function replaceGroupWithdrawalAllocations(
  groupId: string,
  withdrawalId: string,
  allocations: AllocationInput[],
) {
  return put<Withdrawal>(
    `/api/groups/${groupId}/withdrawals/${withdrawalId}/allocations`,
    { allocations },
  );
}

export function createGroupWithdrawalClaims(
  groupId: string,
  withdrawalId: string,
) {
  return post<{ claims: Claim[] }>(
    `/api/groups/${groupId}/withdrawals/${withdrawalId}/claims`,
    {},
  );
}
