import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroupClaim, updateGroupClaimStatus } from "./api";
import type { Claim } from "./types";
import { claimQueries } from "./queries";
import { withdrawalQueries } from "../withdrawal/queries";

type ClaimTarget = { groupId: string; claimId: string };

export const useUpdateClaimStatus = () => {
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

export const useDeleteClaim = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, claimId }: ClaimTarget) =>
      deleteGroupClaim(groupId, claimId),
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
