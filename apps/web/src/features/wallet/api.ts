import { del, get, post } from "../../lib/api-client";
import type { CreateWalletInput, Wallet } from "./types";

export type { CreateWalletInput, Wallet } from "./types";

export const getGroupWallets = async (
  groupId: string,
  signal?: AbortSignal,
) => {
  const response = await get<{ wallets: Wallet[] }>(
    `/api/groups/${groupId}/wallets`,
    signal,
  );
  return response.wallets;
};

export const createGroupWallet = (
  groupId: string,
  input: CreateWalletInput,
) => {
  return post<Wallet>(`/api/groups/${groupId}/wallets`, input);
};

export const deleteGroupWallet = (groupId: string, walletId: string) => {
  return del(`/api/groups/${groupId}/wallets/${walletId}`);
};
