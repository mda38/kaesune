import { get } from "@/lib/api-client";
import type { ClaimListItem } from "@/features/claim/types/claim";
export const getGroupClaims = async (groupId: string, signal?: AbortSignal) => {
  const response = await get<{ claims: ClaimListItem[] }>(
    `/api/groups/${groupId}/claims`,
    signal,
  );
  return response.claims;
};
