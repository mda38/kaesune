import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupMembers } from "@/features/group/api/get-group-members";
import { getCurrentUser } from "@/features/group/api/get-current-user";

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
