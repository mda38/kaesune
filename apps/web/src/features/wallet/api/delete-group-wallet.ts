import { del } from "@/lib/api-client";
export const deleteGroupWallet = (groupId: string, walletId: string) => {
  return del(`/api/groups/${groupId}/wallets/${walletId}`);
};
