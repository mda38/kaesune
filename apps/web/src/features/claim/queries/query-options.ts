import type { ClaimListItem } from "@/features/claim/types/claim";
import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupClaim } from "@/features/claim/api/get-group-claim";
import { getGroupClaims } from "@/features/claim/api/get-group-claims";

import type { QueryClient } from "@tanstack/react-query";

export const claimQueries = {
  detail: (
    groupId: string | undefined,
    claimId: string | undefined,
    client?: QueryClient,
  ) =>
    queryOptions({
      queryKey: ["groups", groupId, "claims", "detail", claimId],
      queryFn:
        groupId && claimId
          ? ({ signal }) => getGroupClaim(groupId, claimId, signal)
          : skipToken,
      initialData: () => {
        const listKey = claimQueries.list(groupId).queryKey;
        if (client?.getQueryState(listKey)?.isInvalidated) return undefined;
        return client
          ?.getQueryData<ClaimListItem[]>(listKey)
          ?.find((item) => item.id === claimId);
      },
      initialDataUpdatedAt: () =>
        client?.getQueryState(claimQueries.list(groupId).queryKey)
          ?.dataUpdatedAt,
    }),
  list: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "claims"],
      queryFn: groupId
        ? ({ signal }) => getGroupClaims(groupId, signal)
        : skipToken,
    }),
};
