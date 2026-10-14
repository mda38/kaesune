import { useQuery } from "@tanstack/react-query";
import { walletQueries } from "@/features/wallet/queries/query-options";

export const useWalletsQuery = (groupId: string | undefined) => {
  return useQuery(walletQueries.list(groupId));
};
