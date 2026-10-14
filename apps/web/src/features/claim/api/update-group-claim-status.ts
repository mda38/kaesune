import { patch } from "@/lib/api-client";
import type { Claim } from "@/features/claim/types/claim";
export const updateGroupClaimStatus = (
  groupId: string,
  claimId: string,
  status: Claim["status"],
) => {
  return patch<Claim>(`/api/groups/${groupId}/claims/${claimId}`, { status });
};
