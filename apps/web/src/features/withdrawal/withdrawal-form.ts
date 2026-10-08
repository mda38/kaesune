import type { CreateWithdrawalInput } from "@/features/withdrawal/types";

export type WithdrawalFormValues = {
  purpose: string;
  amount: string;
  walletId: string;
  withdrawnOn: string;
  note: string;
};

export const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const initialWithdrawalForm = (): WithdrawalFormValues => ({
  purpose: "",
  amount: "",
  walletId: "",
  withdrawnOn: today(),
  note: "",
});

export const validateWithdrawalForm = (
  form: WithdrawalFormValues,
): string | null => {
  if (!form.purpose.trim()) return "用途を入力してください。";
  if (!/^[1-9][0-9]*$/.test(form.amount))
    return "金額は正の円整数で入力してください。";
  if (!form.walletId) return "出金元の財布を選択してください。";
  return null;
};

export const toWithdrawalInput = (
  form: WithdrawalFormValues,
): CreateWithdrawalInput => ({
  purpose: form.purpose.trim(),
  amount: form.amount,
  walletId: form.walletId,
  withdrawnOn: form.withdrawnOn || today(),
  ...(form.note.trim() ? { note: form.note.trim() } : {}),
});
