import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupClaims } from "@/features/claim/api";

export const claimQueries = {
  list: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "claims"],
      queryFn: groupId
        ? ({ signal }) => getGroupClaims(groupId, signal)
        : skipToken,
    }),
};
