import { walletQueries } from "@/features/wallet/queries";
import { useQuery } from "@tanstack/react-query";
import { QueryErrorNotice } from "@/components/ui/query-error-notice";
import { withdrawalQueries } from "@/features/withdrawal/queries";
import { WithdrawalList } from "@/features/withdrawal/components/withdrawal-list";
import { BottomNav } from "@/layouts/bottom-nav";
import { Card } from "@/components/ui/card";
import { useGroupContext } from "@/features/group/use-group-context";

export function RecordsPage() {
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const query = useQuery(withdrawalQueries.list(currentGroup?.id));
  const withdrawals = query.data ?? [];
  const areRecordsLoading = Boolean(currentGroup) && query.isPending;
  const recordsError = query.error?.message ?? null;
  const refreshRecords = async () => {
    await query.refetch();
  };

  const walletsQuery = useQuery(walletQueries.list(currentGroup?.id));
  const wallets = walletsQuery.data ?? [];

  const walletNameById = new Map(
    wallets.map((wallet) => [wallet.id, wallet.name]),
  );

  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl bg-white px-6 pt-8 pb-28">
      <header className="mb-9">
        <h1 className="text-[34px] leading-tight font-extrabold tracking-[-0.06em] text-black">
          Record
        </h1>
        <p className="text-xs font-bold text-black">出金記録を管理</p>
      </header>
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={query.data !== undefined ? recordsError : null}
        onRetry={refreshRecords}
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
      ) : areRecordsLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            出金記録を取得中です…
          </p>
        </Card>
      ) : recordsError && query.data === undefined ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {recordsError}
          </p>
          <button
            type="button"
            onClick={() => void refreshRecords()}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : withdrawals.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-neutral-600">まだ出金記録はありません。</p>
        </Card>
      ) : (
        <WithdrawalList
          withdrawals={withdrawals}
          walletNameById={walletNameById}
        />
      )}
      <BottomNav active="records" />
    </main>
  );
}
