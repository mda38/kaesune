import { Message } from "@/pages/invoices/invoice-detail-message";
import {
  useDeleteClaim,
  useUpdateClaimStatus,
} from "@/features/claim/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryErrorNotice } from "@/components/ui/query-error-notice";
import { claimQueries } from "@/features/claim/queries";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BottomNav } from "@/layouts/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useGroupContext } from "@/features/group/use-group-context";

export function InvoiceDetailPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const query = useQuery(
    claimQueries.detail(currentGroup?.id, claimId, client),
  );
  const claim = query.data;
  const areClaimsLoading = Boolean(currentGroup) && query.isPending;
  const claimsError = query.error?.message ?? null;
  const refreshClaim = async () => {
    await query.refetch();
  };
  const updateMutation = useUpdateClaimStatus();
  const deleteMutation = useDeleteClaim();
  const isUpdatingStatus = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const actionError =
    updateMutation.error?.message ?? deleteMutation.error?.message ?? null;

  const updateStatus = (status: "unsettled" | "settled") => {
    if (!currentGroup || !claim || isUpdatingStatus || isDeleting) return;
    deleteMutation.reset();
    updateMutation.mutate({
      groupId: currentGroup.id,
      claimId: claim.id,
      status,
    });
  };

  const deleteClaim = () => {
    if (!currentGroup || !claim || isUpdatingStatus || isDeleting) return;
    if (
      !window.confirm(
        `「${claim.debtorMemberName}さんへの請求」を削除しますか？`,
      )
    )
      return;
    updateMutation.reset();
    deleteMutation.mutate(
      { groupId: currentGroup.id, claimId: claim.id },
      {
        onSuccess: () => navigate("/invoices", { replace: true }),
      },
    );
  };

  const isSettled = claim?.status === "settled";

  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl bg-white px-6 pt-6 pb-28 text-black">
      <Link
        className="mb-8 inline-flex items-center gap-1 text-sm font-bold"
        to="/invoices"
      >
        <Icon name="back" size={18} />
        請求一覧へ戻る
      </Link>
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={query.data !== undefined ? claimsError : null}
        onRetry={refreshClaim}
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
        <Message error={claimsError} onRetry={refreshClaim}>
          {claimsError}
        </Message>
      ) : !claim ? (
        <Message error="not-found">
          指定された請求は見つかりませんでした。
        </Message>
      ) : (
        <article>
          <header className="mb-8">
            <p className="mb-1 text-xs font-bold">請求の詳細</p>
            <h1 className="text-[34px] leading-tight font-extrabold tracking-[-0.04em]">
              {claim.debtorMemberName}さんへの請求
            </h1>
          </header>
          <Card className="mb-6 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs text-neutral-600">請求金額</p>
                <strong className="text-3xl tracking-[-0.04em]">
                  ¥{BigInt(claim.amount).toLocaleString("ja-JP")}
                </strong>
              </div>
              <Badge>{isSettled ? "精算済み" : "未精算"}</Badge>
            </div>
            <div className="mt-5 border-t border-black pt-4">
              <p className="mb-1 text-xs text-neutral-600">返済先</p>
              <p className="font-bold">{claim.walletName}</p>
            </div>
          </Card>
          <section aria-labelledby="invoice-items-heading">
            <h2 id="invoice-items-heading" className="mb-3 text-sm font-bold">
              請求の内訳
            </h2>
            <Card>
              {claim.items.length > 0 ? (
                claim.items.map((item) => (
                  <div
                    className="flex items-center justify-between gap-4 border-b border-black px-4 py-3.5 last:border-b-0"
                    key={item.withdrawalId}
                  >
                    <p className="font-bold">{item.purpose}</p>
                    <strong className="shrink-0">
                      ¥{BigInt(item.amount).toLocaleString("ja-JP")}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-neutral-600">
                  内訳はありません。
                </p>
              )}
            </Card>
          </section>
          <section className="mt-8" aria-labelledby="settlement-heading">
            <h2 id="settlement-heading" className="mb-3 text-sm font-bold">
              精算状況
            </h2>
            <Card className="p-4">
              {isSettled ? (
                <div>
                  <div className="flex items-center gap-3" role="status">
                    <span className="grid size-10 place-items-center rounded-full bg-black text-white">
                      <Icon name="check" />
                    </span>
                    <div>
                      <p className="font-bold">精算が完了しました</p>
                      <p className="text-xs text-neutral-600">
                        この請求は精算済みです。
                      </p>
                    </div>
                  </div>
                  <button
                    className="mt-4 text-sm font-bold underline disabled:text-neutral-400"
                    disabled={isUpdatingStatus || isDeleting}
                    onClick={() => void updateStatus("unsettled")}
                    type="button"
                  >
                    {isUpdatingStatus ? "取消中…" : "精算完了を取り消す"}
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    checked={false}
                    className="size-5 accent-black"
                    disabled={isUpdatingStatus || isDeleting}
                    onChange={(event) => {
                      if (event.target.checked) void updateStatus("settled");
                    }}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-bold">精算を完了する</span>
                    <span className="block text-xs text-neutral-600">
                      チェックすると、この請求を精算済みにします。
                    </span>
                  </span>
                </label>
              )}
            </Card>
            {actionError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {actionError}
              </p>
            )}
          </section>
          <button
            className="mt-8 w-full border border-red-600 py-3 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
            disabled={isUpdatingStatus || isDeleting}
            onClick={() => void deleteClaim()}
            type="button"
          >
            {isDeleting ? "削除中…" : "請求を削除する"}
          </button>
        </article>
      )}
      <BottomNav active="invoices" />
    </main>
  );
}
