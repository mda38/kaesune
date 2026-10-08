import type { ClaimListItem } from "@/features/claim/types";
import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupClaim, getGroupClaims } from "@/features/claim/api";

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
      initialData: () =>
        client
          ?.getQueryData<ClaimListItem[]>(["groups", groupId, "claims"])
          ?.find((item) => item.id === claimId),
      initialDataUpdatedAt: () =>
        client?.getQueryState(["groups", groupId, "claims"])?.dataUpdatedAt,
    }),
  list: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "claims"],
      queryFn: groupId
        ? ({ signal }) => getGroupClaims(groupId, signal)
        : skipToken,
    }),
};
