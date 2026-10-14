import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupWallet } from "@/features/wallet/api/create-group-wallet";
import type { CreateWalletInput } from "@/features/wallet/types/wallet";
import { walletQueries } from "@/features/wallet/queries/query-options";
export const useCreateWalletMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string;
      input: CreateWalletInput;
    }) => createGroupWallet(groupId, input),
    onSuccess: (_data, { groupId }) =>
      client.invalidateQueries({
        queryKey: walletQueries.list(groupId).queryKey,
      }),
  });
};
