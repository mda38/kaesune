import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupWithdrawalClaims } from "@/features/allocation/api/create-group-withdrawal-claims";
import { replaceGroupWithdrawalAllocations } from "@/features/allocation/api/replace-group-withdrawal-allocations";
import { type AllocationInput } from "@/features/allocation/types/allocation";
import { claimQueries } from "@/features/claim/queries/query-options";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";
export const useCreateWithdrawalClaimsMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      withdrawalId,
      allocations,
    }: {
      groupId: string;
      withdrawalId: string;
      allocations: AllocationInput[];
    }) => {
      await replaceGroupWithdrawalAllocations(
        groupId,
        withdrawalId,
        allocations,
      );
      return createGroupWithdrawalClaims(groupId, withdrawalId);
    },
    // 配分保存だけ成功した場合や、応答が失われた場合もサーバーの状態を確認する。
    onSettled: async (_data, _error, { groupId }) => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: withdrawalQueries.list(groupId).queryKey,
        }),
        client.invalidateQueries({
          queryKey: claimQueries.list(groupId).queryKey,
        }),
      ]);
    },
  });
};
