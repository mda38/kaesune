import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupWallets } from "@/features/wallet/api/get-group-wallets";

export const walletQueries = {
  list: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "wallets"],
      queryFn: groupId
        ? ({ signal }) => getGroupWallets(groupId, signal)
        : skipToken,
    }),
};
