import { useQuery } from "@tanstack/react-query";
import { groupQueries } from "@/features/group/queries/query-options";

export const useGroupMembersQuery = (groupId: string | undefined) => {
  return useQuery(groupQueries.members(groupId));
};
