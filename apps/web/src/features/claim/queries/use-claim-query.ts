import { useQuery, useQueryClient } from "@tanstack/react-query";
import { claimQueries } from "@/features/claim/queries/query-options";

export const useClaimQuery = (
  groupId: string | undefined,
  id: string | undefined,
) => {
  const client = useQueryClient();
  return useQuery(claimQueries.detail(groupId, id, client));
};
