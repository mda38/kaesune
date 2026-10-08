import { queryOptions, skipToken } from "@tanstack/react-query";
import { getGroupWithdrawals } from "@/features/withdrawal/api";

export const withdrawalQueries = {
  list: (groupId: string | undefined) =>
    queryOptions({
      queryKey: ["groups", groupId, "withdrawals"],
      queryFn: groupId
        ? ({ signal }) => getGroupWithdrawals(groupId, signal)
        : skipToken,
    }),
};
