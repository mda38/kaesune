import { useQuery } from "@tanstack/react-query";
import { claimQueries } from "@/features/claim/queries/query-options";

export const useClaimsQuery = (groupId: string | undefined) => {
  return useQuery(claimQueries.list(groupId));
};
