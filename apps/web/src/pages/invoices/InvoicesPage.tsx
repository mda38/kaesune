import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryErrorNotice } from "../../components/ui/QueryErrorNotice";
import { claimQueries } from "../../features/claim/queries";
import { Link } from "react-router-dom";
import type { ClaimListItem } from "../../features/claim/types";
import { Heading, Screen } from "../../layouts";
import { Badge, Card, Icon } from "../../components/ui";
import { useGroupContext } from "../../features/group/useGroupContext";

type ClaimFilter = "all" | ClaimListItem["status"];

const filters: { label: string; value: ClaimFilter }[] = [
  { label: "すべて", value: "all" },
  { label: "未精算", value: "unsettled" },
  { label: "精算済み", value: "settled" },
];

const statusLabels: Record<ClaimListItem["status"], string> = {
  unsettled: "未精算",
  settled: "精算済み",
};

export function InvoicesPage() {
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const query = useQuery(claimQueries.list(currentGroup?.id));
  const claims = query.data ?? [];
  const areClaimsLoading = Boolean(currentGroup) && query.isPending;
  const claimsError = query.error?.message ?? null;
  const refreshClaims = async () => {
    await query.refetch();
  };
  const [filter, setFilter] = useState<ClaimFilter>("all");

  const filteredClaims = claims.filter(
    (claim) => filter === "all" || claim.status === filter,
  );

  return (
    <Screen active="invoices">
      <Heading eyebrow="請求・精算状況を確認" title="請求一覧" />
      <div
        className="mt-[-10px] mb-5 flex flex-wrap gap-2"
        role="group"
        aria-label="請求状態"
      >
        {filters.map(({ label, value }) => (
          <button
            type="button"
            key={value}
            onClick={() => setFilter(value)}
            className={`border border-black px-4 py-2 text-xs font-bold ${
              filter === value ? "bg-black text-white" : "bg-white text-black"
            }`}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
      </div>
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={query.data !== undefined ? claimsError : null}
        onRetry={refreshClaims}
      />
      {isLoading ? (
        <Message>グループ情報を取得中です…</Message>
      ) : !currentGroup ? (
        <Message
          error={errorMessage}
          onRetry={errorMessage ? refresh : undefined}
        >
          {errorMessage ?? "現在、所属しているグループはありません。"}
        </Message>
      ) : areClaimsLoading ? (
        <Message>請求を取得中です…</Message>
      ) : claimsError && query.data === undefined ? (
        <Message error={claimsError} onRetry={refreshClaims}>
          {claimsError}
        </Message>
      ) : filteredClaims.length === 0 ? (
        <Message>
          {claims.length === 0
            ? "まだ請求はありません。"
            : "該当する請求はありません。"}
        </Message>
      ) : (
        <Card>
          {filteredClaims.map((claim) => (
            <Link
              className="flex min-h-[88px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0"
              key={claim.id}
              to={`/invoices/${claim.id}`}
            >
              <span className="grid size-10 shrink-0 place-items-center bg-neutral-100 text-black">
                <Icon name={claim.status === "settled" ? "check" : "wallet"} />
              </span>
              <div className="min-w-0 flex-1 break-words">
                <b className="block text-sm">
                  {claim.debtorMemberName}さんへの請求
                </b>
                <small className="mt-0.5 block text-xs text-neutral-600">
                  {claim.items.length > 0
                    ? claim.items.map((item) => item.purpose).join("、")
                    : "内訳なし"}
                </small>
                <small className="mt-0.5 block text-xs text-neutral-600">
                  返済先: {claim.walletName}
                </small>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <strong>¥{BigInt(claim.amount).toLocaleString("ja-JP")}</strong>
                <Badge>{statusLabels[claim.status]}</Badge>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Message({
  children,
  error,
  onRetry,
}: {
  children: string;
  error?: string | null;
  onRetry?: () => void | Promise<void>;
}) {
  return (
    <Card className="p-4">
      <p
        className="text-sm text-neutral-600"
        role={error ? "alert" : undefined}
        aria-busy={!error && children.endsWith("…") ? "true" : undefined}
      >
        {children}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-3 text-sm font-bold underline"
        >
          再試行
        </button>
      )}
    </Card>
  );
}
