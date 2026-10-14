import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroupClaim } from "@/features/claim/api/delete-group-claim";
import { claimQueries } from "@/features/claim/queries/query-options";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";
type ClaimTarget = { groupId: string; claimId: string };

export const useDeleteClaimMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, claimId }: ClaimTarget) =>
      deleteGroupClaim(groupId, claimId),
    onSuccess: async (_data, { groupId, claimId }) => {
      client.setQueryData(claimQueries.detail(groupId, claimId).queryKey, null);
      await Promise.all([
        client.invalidateQueries({
          queryKey: claimQueries.list(groupId).queryKey,
        }),
        client.invalidateQueries({
          queryKey: withdrawalQueries.list(groupId).queryKey,
        }),
      ]);
    },
  });
};
