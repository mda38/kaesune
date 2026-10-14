import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroupClaimStatus } from "@/features/claim/api/update-group-claim-status";
import type { Claim } from "@/features/claim/types/claim";
import { claimQueries } from "@/features/claim/queries/query-options";
import { withdrawalQueries } from "@/features/withdrawal/queries/query-options";
type ClaimTarget = { groupId: string; claimId: string };

export const useUpdateClaimStatusMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      claimId,
      status,
    }: ClaimTarget & { status: Claim["status"] }) =>
      updateGroupClaimStatus(groupId, claimId, status),
    onSuccess: async (_data, { groupId }) => {
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
