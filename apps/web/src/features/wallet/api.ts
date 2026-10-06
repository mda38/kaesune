import { del, get, post } from "../../lib/api-client";
import type { CreateWalletInput, Wallet } from "./types";

export type { CreateWalletInput, Wallet } from "./types";

export async function getGroupWallets(groupId: string) {
  const response = await get<{ wallets: Wallet[] }>(
    `/api/groups/${groupId}/wallets`,
  );
  return response.wallets;
}

export function createGroupWallet(groupId: string, input: CreateWalletInput) {
  return post<Wallet>(`/api/groups/${groupId}/wallets`, input);
}

export function deleteGroupWallet(groupId: string, walletId: string) {
  return del(`/api/groups/${groupId}/wallets/${walletId}`);
}
