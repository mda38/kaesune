import { useQuery } from "@tanstack/react-query";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";

export const useWithdrawalsQuery = (groupId: string | undefined) => {
  return useQuery(withdrawalQueries.list(groupId));
};
