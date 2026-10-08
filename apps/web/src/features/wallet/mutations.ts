import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupWallet, deleteGroupWallet } from "./api";
import type { CreateWalletInput } from "./types";
import { walletQueries } from "./queries";

export const useCreateWallet = () => {
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

export const useDeleteWallet = () => {
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
