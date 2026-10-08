import type { FormEvent, ReactNode, RefObject } from "react";
import { Card } from "@/components/ui/card";
import type { Wallet } from "@/features/wallet/types";
import type { CreateWithdrawalInput } from "@/features/withdrawal/types";
import { formatAmount, parseAmount } from "@/features/withdrawal/amount";
import { useWithdrawalForm } from "@/features/withdrawal/use-withdrawal-form";

type Props = {
  amountInputRef: RefObject<HTMLInputElement | null>;
  wallets: Wallet[];
  isReady: boolean;
  isSubmitting: boolean;
  mutationError: string | null;
  onSave: (input: CreateWithdrawalInput) => void;
  onClose: () => void;
  children: ReactNode;
};

export function WithdrawalForm({
  amountInputRef,
  wallets,
  isReady,
  isSubmitting,
  mutationError,
  onSave,
  onClose: closeDialog,
  children,
}: Props) {
  const { form, setField, validationError, isFormReady, validate } =
    useWithdrawalForm();
  const submitError = validationError ?? mutationError;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady || isSubmitting) return;
    const input = validate();
    if (input) onSave(input);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-[calc(100svh-180px)] flex-col"
    >
      <label className="border-b border-black pb-2">
        <span className="sr-only">金額</span>
        <div className="flex items-center gap-3">
          <span className="text-[42px] leading-none font-extrabold">¥</span>
          <input
            ref={amountInputRef}
            value={formatAmount(form.amount)}
            onChange={(event) =>
              setField("amount", parseAmount(event.target.value))
            }
            className="min-w-0 flex-1 bg-transparent text-right text-[42px] leading-none font-extrabold outline-none placeholder:text-neutral-300"
            inputMode="numeric"
            placeholder="0"
            aria-label="金額"
            disabled={isSubmitting}
          />
        </div>
      </label>
      {children}
      {isReady && (
        <>
          <Card className="mt-6">
            <label className="block border-b border-black">
              <span className="sr-only">出金元の財布</span>
              <select
                value={form.walletId}
                onChange={(event) => setField("walletId", event.target.value)}
                className={`h-14 w-full bg-white px-4 text-base font-bold outline-none ${
                  form.walletId ? "text-black" : "text-neutral-400"
                }`}
                disabled={isSubmitting}
              >
                <option value="">どの財布から出金しましたか？</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">用途</span>
              <input
                value={form.purpose}
                onChange={(event) => setField("purpose", event.target.value)}
                className="h-14 w-full px-4 text-base font-bold outline-none placeholder:text-neutral-400"
                maxLength={200}
                placeholder="何に使いましたか？"
                disabled={isSubmitting}
              />
            </label>
          </Card>
          <label className="mt-3 ml-auto flex w-fit items-center gap-2 border border-black px-2 py-1 text-sm font-bold">
            <span>日付（任意）</span>
            <input
              type="date"
              value={form.withdrawnOn}
              onChange={(event) => setField("withdrawnOn", event.target.value)}
              className="w-28 bg-transparent text-right outline-none"
              disabled={isSubmitting}
            />
          </label>
          <label className="mt-6 block text-sm font-bold">
            <span className="mb-2 block">メモ（任意）</span>
            <textarea
              value={form.note}
              onChange={(event) => setField("note", event.target.value)}
              className="h-24 w-full border border-black p-4 text-base outline-none"
              maxLength={1000}
              placeholder="例：駅前パーキング"
              disabled={isSubmitting}
            />
          </label>
          {submitError && (
            <p className="mt-4 text-sm" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isFormReady}
            className="mt-auto grid h-12 w-full place-items-center bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-500"
          >
            {isSubmitting ? "保存中…" : "出金を記録する"}
          </button>
          <button
            type="button"
            onClick={closeDialog}
            className="mt-3 grid h-12 w-full place-items-center border border-black text-sm font-bold"
          >
            キャンセル
          </button>
        </>
      )}
    </form>
  );
}
