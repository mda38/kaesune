import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroupWithdrawalClaims,
  replaceGroupWithdrawalAllocations,
  type AllocationInput,
} from "./api";
import { claimQueries } from "../claim/queries";
import { withdrawalQueries } from "../withdrawal/queries";

export const useCreateWithdrawalClaims = () => {
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
