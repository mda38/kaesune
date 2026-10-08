import type { Withdrawal } from "@/features/withdrawal/types";
import { queryOptions, skipToken } from "@tanstack/react-query";
import {
  getGroupWithdrawal,
  getGroupWithdrawals,
} from "@/features/withdrawal/api";

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
      initialData: () =>
        client
          ?.getQueryData<Withdrawal[]>(["groups", groupId, "withdrawals"])
          ?.find((item) => item.id === withdrawalId),
      initialDataUpdatedAt: () =>
        client?.getQueryState(["groups", groupId, "withdrawals"])
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
