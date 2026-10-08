import { del, get, patch } from "@/lib/api-client";
import type { Claim, ClaimListItem } from "@/features/claim/types";

export type { Claim, ClaimListItem } from "@/features/claim/types";

export const getGroupClaims = async (groupId: string, signal?: AbortSignal) => {
  const response = await get<{ claims: ClaimListItem[] }>(
    `/api/groups/${groupId}/claims`,
    signal,
  );
  return response.claims;
};

export const updateGroupClaimStatus = (
  groupId: string,
  claimId: string,
  status: Claim["status"],
) => {
  return patch<Claim>(`/api/groups/${groupId}/claims/${claimId}`, { status });
};

export const deleteGroupClaim = (groupId: string, claimId: string) => {
  return del(`/api/groups/${groupId}/claims/${claimId}`);
};
