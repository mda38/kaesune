import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroupWallet } from "@/features/wallet/api/delete-group-wallet";
import { walletQueries } from "@/features/wallet/queries/query-options";
export const useDeleteWalletMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      walletId,
    }: {
      groupId: string;
      walletId: string;
    }) => deleteGroupWallet(groupId, walletId),
    onSuccess: (_data, { groupId }) =>
      client.invalidateQueries({
        queryKey: walletQueries.list(groupId).queryKey,
      }),
  });
};
