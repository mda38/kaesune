import type { Withdrawal } from "@/features/withdrawal/types/withdrawal";
import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupWithdrawal } from "@/features/withdrawal/api/get-group-withdrawal";
import { getGroupWithdrawals } from "@/features/withdrawal/api/get-group-withdrawals";

import type { QueryClient } from "@tanstack/react-query";

export const withdrawalQueries = {
  detail: (
    groupId: string | undefined,
    withdrawalId: string | undefined,
    client?: QueryClient,
  ) =>
    queryOptions({
      queryKey: ["groups", groupId, "withdrawals", "detail", withdrawalId],
      queryFn:
        groupId && withdrawalId
          ? ({ signal }) => getGroupWithdrawal(groupId, withdrawalId, signal)
          : skipToken,
      initialData: () => {
        const listKey = withdrawalQueries.list(groupId).queryKey;
        if (client?.getQueryState(listKey)?.isInvalidated) return undefined;
        return client
          ?.getQueryData<Withdrawal[]>(listKey)
          ?.find((item) => item.id === withdrawalId);
      },
      initialDataUpdatedAt: () =>
        client?.getQueryState(withdrawalQueries.list(groupId).queryKey)
          ?.dataUpdatedAt,
    }),
  list: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "withdrawals"],
      queryFn: groupId
        ? ({ signal }) => getGroupWithdrawals(groupId, signal)
        : skipToken,
    }),
};
