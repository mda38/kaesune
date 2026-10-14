import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupWithdrawal } from "@/features/withdrawal/api/create-group-withdrawal";
import type { CreateWithdrawalInput } from "@/features/withdrawal/types/withdrawal";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";
export const useCreateWithdrawalMutation = () => {
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
