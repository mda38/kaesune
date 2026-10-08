import { del, get, post } from "@/lib/api-client";
import type {
  CreateWithdrawalInput,
  Withdrawal,
} from "@/features/withdrawal/types";

export type {
  CreateWithdrawalInput,
  Withdrawal,
} from "@/features/withdrawal/types";

export const getGroupWithdrawals = async (
  groupId: string,
  signal?: AbortSignal,
) => {
  const response = await get<{ withdrawals: Withdrawal[] }>(
    `/api/groups/${groupId}/withdrawals`,
    signal,
  );
  return response.withdrawals;
};

export const createGroupWithdrawal = (
  groupId: string,
  input: CreateWithdrawalInput,
) => {
  return post<Withdrawal>(`/api/groups/${groupId}/withdrawals`, input);
};

export const deleteGroupWithdrawal = (
  groupId: string,
  withdrawalId: string,
) => {
  return del(`/api/groups/${groupId}/withdrawals/${withdrawalId}`);
};
