import { get } from "@/lib/api-client";
import type { Wallet } from "@/features/wallet/types/wallet";
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
