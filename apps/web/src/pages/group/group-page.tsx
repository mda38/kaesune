import { useQuery } from "@tanstack/react-query";
import { QueryErrorNotice } from "@/components/ui/query-error-notice";
import { groupQueries } from "@/features/group/queries";
import { Heading } from "@/layouts/heading";
import { Screen } from "@/layouts/screen";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGroupContext } from "@/features/group/use-group-context";

export function GroupPage() {
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const query = useQuery(groupQueries.members(currentGroup?.id));
  const members = query.data ?? [];
  const areMembersLoading = Boolean(currentGroup) && query.isPending;
  const membersError = query.error?.message ?? null;
  const refreshMembers = async () => {
    await query.refetch();
  };

  return (
    <Screen active="mypage">
      <Heading eyebrow={currentGroup?.name ?? "グループ"} title="グループ" />
      <section>
        <h2 className="mb-3 text-[15px] font-bold">メンバー</h2>
        <QueryErrorNotice
          message={currentGroup ? errorMessage : null}
          onRetry={refresh}
        />
        <QueryErrorNotice
          message={query.data !== undefined ? membersError : null}
          onRetry={refreshMembers}
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
        ) : areMembersLoading ? (
          <Card className="p-4">
            <p className="text-sm" aria-busy="true">
              メンバー情報を取得中です…
            </p>
          </Card>
        ) : membersError && query.data === undefined ? (
          <Card className="p-4">
            <p className="text-sm" role="alert">
              {membersError}
            </p>
            <button
              type="button"
              onClick={() => void refreshMembers()}
              className="mt-3 text-sm font-bold underline"
            >
              再試行
            </button>
          </Card>
        ) : (
          <Card>
            {members.map((member, index) => (
              <div
                key={member.id}
                className={`flex min-h-[73px] items-center gap-3 px-3.5 py-3 ${index < members.length - 1 ? "border-b border-black" : ""}`}
              >
                <Avatar name={member.name} />
                <div className="flex-1">
                  <b className="block text-sm">{member.name}</b>
                  <small className="block text-xs text-neutral-600">
                    {member.role === "owner" ? "管理者" : "メンバー"}
                  </small>
                </div>
                {member.id === currentGroup.memberId && <Badge>あなた</Badge>}
              </div>
            ))}
          </Card>
        )}
      </section>
    </Screen>
  );
}
