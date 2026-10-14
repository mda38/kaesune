import { post } from "@/lib/api-client";
import type { CreateWalletInput, Wallet } from "@/features/wallet/types/wallet";
export const createGroupWallet = (
  groupId: string,
  input: CreateWalletInput,
) => {
  return post<Wallet>(`/api/groups/${groupId}/wallets`, input);
};
