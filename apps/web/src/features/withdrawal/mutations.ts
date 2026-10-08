import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroupWithdrawal,
  deleteGroupWithdrawal,
} from "@/features/withdrawal/api";
import type { CreateWithdrawalInput } from "@/features/withdrawal/types";
import { withdrawalQueries } from "@/features/withdrawal/queries";

export const useCreateWithdrawal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string;
      input: CreateWithdrawalInput;
    }) => createGroupWithdrawal(groupId, input),
    onSuccess: (_data, { groupId }) =>
      client.invalidateQueries({
        queryKey: withdrawalQueries.list(groupId).queryKey,
      }),
  });
};

export const useDeleteWithdrawal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      withdrawalId,
    }: {
      groupId: string;
      withdrawalId: string;
    }) => deleteGroupWithdrawal(groupId, withdrawalId),
    onSuccess: (_data, { groupId }) =>
      client.invalidateQueries({
        queryKey: withdrawalQueries.list(groupId).queryKey,
      }),
  });
};
