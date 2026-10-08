import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withdrawalQueries } from "@/features/withdrawal/queries";
import { walletQueries } from "@/features/wallet/queries";
import { groupQueries } from "@/features/group/queries";

export const useAllocationData = (
  groupId: string | undefined,
  withdrawalId: string | undefined,
) => {
  const client = useQueryClient();
  const withdrawalQuery = useQuery(
    withdrawalQueries.detail(groupId, withdrawalId, client),
  );
  const membersQuery = useQuery(groupQueries.members(groupId));
  const walletsQuery = useQuery(walletQueries.list(groupId));
  const withdrawal = withdrawalQuery.data;
  const members = membersQuery.data ?? [];
  const wallets = walletsQuery.data ?? [];
  const isDataLoading =
    Boolean(groupId) &&
    (withdrawalQuery.isPending ||
      membersQuery.isPending ||
      walletsQuery.isPending);
  const loadError =
    withdrawalQuery.error?.message ??
    membersQuery.error?.message ??
    walletsQuery.error?.message ??
    null;
  const hasData =
    withdrawalQuery.data !== undefined &&
    membersQuery.data !== undefined &&
    walletsQuery.data !== undefined;
  const refreshPageData = async () => {
    await Promise.all([
      withdrawalQuery.refetch(),
      membersQuery.refetch(),
      walletsQuery.refetch(),
    ]);
  };

  const wallet = withdrawal
    ? (wallets.find((item) => item.id === withdrawal.walletId) ?? null)
    : null;
  return {
    withdrawal,
    members,
    wallet,
    isDataLoading,
    loadError,
    hasData,
    refreshPageData,
  };
};
