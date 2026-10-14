import { useQuery } from "@tanstack/react-query";
import { groupQueries } from "@/features/group/queries/query-options";

export const useCurrentUserQuery = () => {
  return useQuery(groupQueries.me());
};
