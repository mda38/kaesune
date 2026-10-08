import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { walletQueries } from "@/features/wallet/queries";
import { useCreateWithdrawal } from "@/features/withdrawal/mutations";
import { QueryErrorNotice } from "@/components/ui/query-error-notice";
import { useGroupContext } from "@/features/group/use-group-context";
import { Screen } from "@/layouts/screen";
import { WithdrawalForm } from "@/features/withdrawal/components/withdrawal-form";
import type { CreateWithdrawalInput } from "@/features/withdrawal/types";
import { Card } from "@/components/ui/card";

export type PaymentDialogHandle = {
  open: () => void;
};

export const PaymentDialog = forwardRef<PaymentDialogHandle>(
  function PaymentDialog(_, ref) {
    const navigate = useNavigate();
    const { currentGroup, errorMessage, isLoading, refresh } =
      useGroupContext();
    const walletsQuery = useQuery(walletQueries.list(currentGroup?.id));
    const wallets = walletsQuery.data ?? [];
    const walletErrorMessage = walletsQuery.error?.message;
    const retryWalletLoad = () => {
      void walletsQuery.refetch();
    };
    const createMutation = useCreateWithdrawal();
    const isSubmitting = createMutation.isPending;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const [formKey, setFormKey] = useState(0);
    const resetForm = () => {
      setFormKey((key) => key + 1);
      createMutation.reset();
    };

    const closeDialog = () => {
      dialogRef.current?.close();
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        dialogRef.current?.showModal();
        amountInputRef.current?.focus();
      },
    }));

    const saveWithdrawal = (input: CreateWithdrawalInput) => {
      if (!currentGroup || isSubmitting) return;
      createMutation.mutate(
        { groupId: currentGroup.id, input },
        { onSuccess: () => navigate("/records") },
      );
    };

    return (
      <dialog
        ref={dialogRef}
        onClose={resetForm}
        aria-labelledby="payment-dialog-title"
        className="fixed inset-0 m-0 h-svh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/50"
      >
        <Screen>
          <header className="relative mb-10 flex items-center justify-center">
            <h1
              id="payment-dialog-title"
              className="text-xl font-extrabold tracking-[-0.04em]"
            >
              出金を記録する
            </h1>
            <button
              type="button"
              onClick={closeDialog}
              className="absolute right-0 grid size-10 place-items-center text-3xl leading-none"
              aria-label="記録をやめる"
            >
              ×
            </button>
          </header>
          <WithdrawalForm
            key={formKey}
            amountInputRef={amountInputRef}
            wallets={wallets}
            isReady={Boolean(currentGroup) && !isLoading && wallets.length > 0}
            isSubmitting={isSubmitting}
            mutationError={createMutation.error?.message ?? null}
            onSave={saveWithdrawal}
            onClose={closeDialog}
          >
            <QueryErrorNotice
              message={currentGroup ? errorMessage : null}
              onRetry={refresh}
            />
            <QueryErrorNotice
              message={
                walletsQuery.data !== undefined ? walletErrorMessage : null
              }
              onRetry={retryWalletLoad}
            />
            {isLoading ? (
              <Card className="mt-6 p-4">
                <p className="text-sm" aria-busy="true">
                  グループ情報を取得中です…
                </p>
              </Card>
            ) : !currentGroup ? (
              <Card className="mt-6 p-4">
                <p className="text-sm" role="alert">
                  {errorMessage ?? "現在、所属しているグループはありません。"}
                </p>
                {errorMessage && (
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="mt-3 text-sm font-bold underline"
                  >
                    再試行
                  </button>
                )}
              </Card>
            ) : walletsQuery.isPending ? (
              <Card className="mt-6 p-4">
                <p className="text-sm" aria-busy="true">
                  財布情報を取得中です…
                </p>
              </Card>
            ) : walletsQuery.isError && walletsQuery.data === undefined ? (
              <Card className="mt-6 p-4">
                <p className="text-sm" role="alert">
                  {walletErrorMessage ?? "財布情報の取得に失敗しました。"}
                </p>
                <button
                  type="button"
                  onClick={retryWalletLoad}
                  className="mt-3 text-sm font-bold underline"
                >
                  再試行
                </button>
              </Card>
            ) : wallets.length === 0 ? (
              <Card className="mt-6 p-4">
                <p className="text-sm">
                  出金を記録するには財布を追加してください。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeDialog();
                    navigate("/wallets");
                  }}
                  className="mt-3 inline-block text-sm font-bold underline"
                >
                  財布管理へ
                </button>
              </Card>
            ) : null}
          </WithdrawalForm>
        </Screen>
      </dialog>
    );
  },
);
