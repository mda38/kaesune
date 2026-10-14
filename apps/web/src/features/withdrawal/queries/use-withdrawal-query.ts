import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";

export const useWithdrawalQuery = (
  groupId: string | undefined,
  id: string | undefined,
) => {
  const client = useQueryClient();
  return useQuery(withdrawalQueries.detail(groupId, id, client));
};
