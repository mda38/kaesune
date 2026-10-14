import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroupWithdrawal } from "@/features/withdrawal/api/delete-group-withdrawal";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";
export const useDeleteWithdrawalMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      withdrawalId,
    }: {
      groupId: string;
      withdrawalId: string;
    }) => deleteGroupWithdrawal(groupId, withdrawalId),
    onSuccess: (_data, { groupId, withdrawalId }) => {
      client.setQueryData(
        withdrawalQueries.detail(groupId, withdrawalId).queryKey,
        null,
      );
      return client.invalidateQueries({
        queryKey: withdrawalQueries.list(groupId).queryKey,
      });
    },
  });
};
