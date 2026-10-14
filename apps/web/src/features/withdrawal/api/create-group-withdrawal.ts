import { post } from "@/lib/api-client";
import type {
  CreateWithdrawalInput,
  Withdrawal,
} from "@/features/withdrawal/types/withdrawal";
export const createGroupWithdrawal = (
  groupId: string,
  input: CreateWithdrawalInput,
) => {
  return post<Withdrawal>(`/api/groups/${groupId}/withdrawals`, input);
};
