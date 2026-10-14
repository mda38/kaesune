import { del } from "@/lib/api-client";
export const deleteGroupClaim = (groupId: string, claimId: string) => {
  return del(`/api/groups/${groupId}/claims/${claimId}`);
};
