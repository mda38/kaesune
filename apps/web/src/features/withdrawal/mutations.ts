import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupWithdrawal, deleteGroupWithdrawal } from "./api";
import type { CreateWithdrawalInput } from "./types";
import { withdrawalQueries } from "./queries";

export function useCreateWithdrawal() {
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
}

export function useDeleteWithdrawal() {
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
}
