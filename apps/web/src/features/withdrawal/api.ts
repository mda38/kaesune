import { del, get, post } from "../../lib/api-client";
import type { CreateWithdrawalInput, Withdrawal } from "./types";

export type { CreateWithdrawalInput, Withdrawal } from "./types";

export async function getGroupWithdrawals(groupId: string) {
  const response = await get<{ withdrawals: Withdrawal[] }>(
    `/api/groups/${groupId}/withdrawals`,
  );
  return response.withdrawals;
}

export function createGroupWithdrawal(
  groupId: string,
  input: CreateWithdrawalInput,
) {
  return post<Withdrawal>(`/api/groups/${groupId}/withdrawals`, input);
}

export function deleteGroupWithdrawal(groupId: string, withdrawalId: string) {
  return del(`/api/groups/${groupId}/withdrawals/${withdrawalId}`);
}
