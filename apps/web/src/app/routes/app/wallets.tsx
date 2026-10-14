import { WalletForm } from "@/features/wallet/components/wallet-form";
import { WalletList } from "@/features/wallet/components/wallet-list";
import { useGroupMembersQuery } from "@/features/group/queries/use-group-members-query";
import { useWalletsQuery } from "@/features/wallet/queries/use-wallets-query";
import { QueryErrorNotice } from "@/components/ui/query-error-notice";
import { Heading } from "@/components/layouts/heading";
import { Screen } from "@/components/layouts/screen";
import { Card } from "@/components/ui/card";
import { useGroupContext } from "@/features/group/hooks/use-group-context";

export function WalletsPage() {
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const walletsQuery = useWalletsQuery(currentGroup?.id);
  const membersQuery = useGroupMembersQuery(currentGroup?.id);
  const wallets = walletsQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const isDataLoading =
    Boolean(currentGroup) && (walletsQuery.isPending || membersQuery.isPending);
  const dataError =
    walletsQuery.error?.message ?? membersQuery.error?.message ?? null;
  const hasData =
    walletsQuery.data !== undefined && membersQuery.data !== undefined;
  const refreshWalletData = async () => {
    await Promise.all([walletsQuery.refetch(), membersQuery.refetch()]);
  };
  const ownerNameById = new Map(
    members.map((member) => [member.id, member.name]),
  );

  return (
    <Screen active="mypage">
      <Heading
        eyebrow={currentGroup?.name ?? "支払い元と返済先"}
        title="財布管理"
      />
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={hasData ? dataError : null}
        onRetry={refreshWalletData}
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
            財布情報を取得中です…
          </p>
        </Card>
      ) : dataError && !hasData ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {dataError}
          </p>
          <button
            type="button"
            onClick={() => void refreshWalletData()}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : (
        <>
          <WalletForm
            key={`form:${currentGroup.id}`}
            groupId={currentGroup.id}
            members={members}
          />
          <WalletList
            key={`list:${currentGroup.id}`}
            groupId={currentGroup.id}
            wallets={wallets}
            ownerNameById={ownerNameById}
          />
        </>
      )}
    </Screen>
  );
}
