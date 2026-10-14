import { ApiRequestError } from "@/lib/api-client";
import { get } from "@/lib/api-client";
import type { ClaimListItem } from "@/features/claim/types/claim";
export const getGroupClaim = async (
  groupId: string,
  claimId: string,
  signal?: AbortSignal,
) => {
  try {
    return await get<ClaimListItem>(
      `/api/groups/${groupId}/claims/${claimId}`,
      signal,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
};
