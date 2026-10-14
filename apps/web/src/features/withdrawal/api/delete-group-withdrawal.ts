import { del } from "@/lib/api-client";
export const deleteGroupWithdrawal = (
  groupId: string,
  withdrawalId: string,
) => {
  return del(`/api/groups/${groupId}/withdrawals/${withdrawalId}`);
};
