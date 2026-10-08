import { StatusCard } from "@/pages/allocation/status-card";
import { QueryErrorNotice } from "@/components/ui/query-error-notice";
import { Link, useParams } from "react-router-dom";
import { Screen } from "@/layouts/screen";
import { Icon } from "@/components/ui/icon";
import { useGroupContext } from "@/features/group/use-group-context";
import { useAllocationData } from "@/features/allocation/use-allocation-data";
import { AllocationForm } from "@/features/allocation/allocation-form";

export function AllocationPage() {
  const { withdrawalId } = useParams();
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const {
    withdrawal,
    members,
    wallet,
    isDataLoading,
    loadError,
    hasData,
    refreshPageData,
  } = useAllocationData(currentGroup?.id, withdrawalId);
  return (
    <Screen className="pb-0">
      <header className="mb-8">
        <Link
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black"
          to={withdrawalId ? `/records/${withdrawalId}` : "/records"}
        >
          <Icon name="back" size={20} />
          出金詳細に戻る
        </Link>
        <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-[-0.06em] text-black">
          負担を割り当てる
        </h1>
      </header>
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={hasData ? loadError : null}
        onRetry={refreshPageData}
      />
      {isLoading ? (
        <StatusCard message="グループ情報を取得中です…" loading />
      ) : !currentGroup ? (
        <StatusCard
          message={errorMessage ?? "現在、所属しているグループはありません。"}
          onRetry={errorMessage ? () => void refresh() : undefined}
        />
      ) : isDataLoading ? (
        <StatusCard message="請求発行に必要な情報を取得中です…" loading />
      ) : loadError && !hasData ? (
        <StatusCard
          message={loadError}
          onRetry={() => void refreshPageData()}
        />
      ) : !withdrawal ? (
        <StatusCard message="指定された出金記録は見つかりませんでした。" />
      ) : !wallet ? (
        <StatusCard message="出金元の財布が見つかりませんでした。" />
      ) : members.length === 0 ? (
        <StatusCard message="負担を割り当てられるメンバーがいません。" />
      ) : (
        <AllocationForm
          key={`${currentGroup.id}:${withdrawal.id}`}
          withdrawal={withdrawal}
          members={members}
          wallet={wallet}
          groupId={currentGroup.id}
          currentMemberId={currentGroup.memberId}
        />
      )}
    </Screen>
  );
}
