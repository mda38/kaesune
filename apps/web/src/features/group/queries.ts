import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupMembers, getCurrentUser } from "@/features/group/api";

export const groupQueries = {
  me: () =>
    queryOptions({
      queryKey: ["me"],
      queryFn: ({ signal }) => getCurrentUser(signal),
    }),
  members: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "members"],
      queryFn: groupId
        ? ({ signal }) => getGroupMembers(groupId, signal)
        : skipToken,
    }),
};
