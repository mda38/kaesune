import { useState } from "react";
import { walletQueries } from "../../features/wallet/queries";
import { useDeleteWithdrawal } from "../../features/withdrawal/mutations";
import { useQuery } from "@tanstack/react-query";
import { QueryErrorNotice } from "../../components/ui/QueryErrorNotice";
import { withdrawalQueries } from "../../features/withdrawal/queries";
import Delete01Icon from "@hugeicons/core-free-icons/Delete01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BottomNav } from "../../layouts";
import { Card } from "../../components/ui";
import { useGroupContext } from "../../features/group/useGroupContext";

export function RecordDetailPage() {
  const { withdrawalId } = useParams();
  const navigate = useNavigate();
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const query = useQuery({
    ...withdrawalQueries.list(currentGroup?.id),
    select: (items) => items.find((item) => item.id === withdrawalId) ?? null,
  });
  const withdrawal = query.data;
  const isDataLoading = Boolean(currentGroup) && query.isPending;
  const dataError = query.error?.message ?? null;
  const refreshRecord = async () => {
    await query.refetch();
  };
  const walletsQuery = useQuery(walletQueries.list(currentGroup?.id));
  const wallets = walletsQuery.data ?? [];
  const deleteMutation = useDeleteWithdrawal();
  const deleteError = deleteMutation.error?.message ?? null;
  const isDeleting = deleteMutation.isPending;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const deleteWithdrawal = () => {
    if (!currentGroup || !withdrawal || isDeleting) return;
    if (!window.confirm(`「${withdrawal.purpose}」を削除しますか？`)) return;
    deleteMutation.mutate(
      { groupId: currentGroup.id, withdrawalId: withdrawal.id },
      {
        onSuccess: () => navigate("/records", { replace: true }),
      },
    );
  };

  const walletName = withdrawal
    ? (wallets.find((wallet) => wallet.id === withdrawal.walletId)?.name ??
      "不明な財布")
    : "";

  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl bg-white px-6 pt-6 pb-28 text-black">
      <div className="mb-8 flex items-center justify-between">
        <Link className="text-sm font-bold" to="/records">
          ← 戻る
        </Link>
        <div className="relative">
          <button
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen ? "操作メニューを閉じる" : "操作メニューを開く"
            }
            className="flex size-8 items-center justify-center text-2xl leading-none"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span aria-hidden="true">⋮</span>
          </button>
          {isMenuOpen && withdrawal?.status === "unallocated" && (
            <div className="absolute top-8 right-0 z-10 min-w-32 border border-black bg-white p-1 shadow-[3px_3px_0_0_#000]">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  void deleteWithdrawal();
                }}
                disabled={isDeleting}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-neutral-400"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={Delete01Icon}
                  size={18}
                  strokeWidth={1.8}
                />
                {isDeleting ? "削除中…" : "削除する"}
              </button>
            </div>
          )}
        </div>
      </div>
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={query.data !== undefined ? dataError : null}
        onRetry={refreshRecord}
      />
      <QueryErrorNotice
        message={walletsQuery.error?.message}
        onRetry={() => walletsQuery.refetch()}
      />
      {isLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            グループ情報を取得中です…
          </p>
        </Card>
      ) : !currentGroup ? (
        <Card className="p-4">
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
      ) : isDataLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            出金記録を取得中です…
          </p>
        </Card>
      ) : dataError && query.data === undefined ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {dataError}
          </p>
          <button
            type="button"
            onClick={() => void refreshRecord()}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : !withdrawal ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            指定された出金記録は見つかりませんでした。
          </p>
        </Card>
      ) : (
        <article>
          <div className="mb-6">
            <h1 className="text-[34px] leading-tight font-extrabold tracking-[-0.04em]">
              ¥{BigInt(withdrawal.amount).toLocaleString("ja-JP")}
            </h1>
          </div>
          {deleteError && (
            <p className="mb-4 text-sm text-red-600" role="alert">
              {deleteError}
            </p>
          )}
          <dl>
            <DetailRow label="出金元" value={walletName} />
            <DetailRow label="用途" value={withdrawal.purpose} />
            <DetailRow
              label="取引日"
              value={withdrawal.withdrawnOn.replaceAll("-", "/")}
            />
            <DetailRow label="メモ" value={withdrawal.note || "—"} />
          </dl>
          <Link
            className="mt-8 grid h-12 w-full place-items-center bg-black text-base font-bold text-white"
            to={`/records/${withdrawal.id}/claims/new`}
          >
            請求を発行する
          </Link>
        </article>
      )}
      <BottomNav active="records" />
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-black py-3.5">
      <dt className="mb-2 text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="text-base font-bold">{value}</dd>
    </div>
  );
}
