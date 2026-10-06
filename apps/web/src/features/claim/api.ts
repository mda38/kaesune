import { del, get, patch } from "../../lib/api-client";
import type { Claim, ClaimListItem } from "./types";

export type { Claim, ClaimListItem } from "./types";

export async function getGroupClaims(groupId: string) {
  const response = await get<{ claims: ClaimListItem[] }>(
    `/api/groups/${groupId}/claims`,
  );
  return response.claims;
}

export function updateGroupClaimStatus(
  groupId: string,
  claimId: string,
  status: Claim["status"],
) {
  return patch<Claim>(`/api/groups/${groupId}/claims/${claimId}`, { status });
}

export function deleteGroupClaim(groupId: string, claimId: string) {
  return del(`/api/groups/${groupId}/claims/${claimId}`);
}
