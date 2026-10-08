import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryErrorNotice } from "../../components/ui/query-error-notice";
import { claimQueries } from "../../features/claim/queries";
import { Link } from "react-router-dom";
import { Heading, Screen } from "../../layouts";
import {
  PaymentDialog,
  type PaymentDialogHandle,
} from "../../features/withdrawal/components/withdrawal-dialog";
import { Badge, Icon } from "../../components/ui";
import walletIllustration from "../../assets/home-wallet-illustration.png";
import { useGroupContext } from "../../features/group/use-group-context";

export function HomePage() {
  const paymentDialogRef = useRef<PaymentDialogHandle>(null);
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const query = useQuery(claimQueries.list(currentGroup?.id));
  const claims = query.data ?? [];
  const areClaimsLoading = Boolean(currentGroup) && query.isPending;
  const claimsError = query.error?.message ?? null;
  const refreshClaims = async () => {
    await query.refetch();
  };

  const unsettledClaims = claims.filter(
    (claim) =>
      claim.debtorMemberId === currentGroup?.memberId &&
      claim.status === "unsettled",
  );
  const unsettledAmount = unsettledClaims.reduce(
    (total, claim) => total + BigInt(claim.amount),
    BigInt(0),
  );

  return (
    <Screen active="home">
      <Heading
        eyebrow=""
        title="Home"
        right={
          <div>
            <Link
              to="/mypage"
              className="grid size-8 place-items-center text-black"
            >
              <Icon name="user" />
            </Link>
          </div>
        }
      />
      <img
        className="mx-auto block h-auto w-full max-w-none object-contain"
        src={walletIllustration}
        alt="財布とコインのイラスト"
      />
      <p className="mt-0 text-[15px] font-bold">
        立て替えた支払いを記録・確認できます
      </p>
      <section className="mt-8" aria-labelledby="claim-summary-heading">
        <p id="claim-summary-heading" className="text-xs font-bold text-black">
          請求総額
        </p>
        <QueryErrorNotice message={errorMessage} onRetry={refresh} />
        <QueryErrorNotice
          message={query.data !== undefined ? claimsError : null}
          onRetry={refreshClaims}
        />
        {isLoading || areClaimsLoading ? (
          <p className="mt-2 text-sm font-bold" aria-busy="true">
            請求金額を取得中です…
          </p>
        ) : claimsError && query.data === undefined ? (
          <div className="mt-2">
            <p className="text-sm font-bold" role="alert">
              {claimsError}
            </p>
            <button
              type="button"
              onClick={() => void refreshClaims()}
              className="mt-2 text-sm font-bold underline"
            >
              再試行
            </button>
          </div>
        ) : !currentGroup && !errorMessage ? (
          <p className="mt-2 text-sm">
            現在、所属しているグループはありません。
          </p>
        ) : currentGroup ? (
          <>
            <p className="mt-1 text-5xl leading-none font-extrabold tracking-[-0.04em]">
              ¥{unsettledAmount.toLocaleString("ja-JP")}
            </p>
            <div className="mt-3">
              <Badge>
                {unsettledClaims.length === 0
                  ? "未精算の請求はありません"
                  : `${unsettledClaims.length}件の請求が未精算です`}
              </Badge>
            </div>
          </>
        ) : null}
      </section>
      <button
        type="button"
        onClick={() => paymentDialogRef.current?.open()}
        className="mt-6 grid h-16 place-items-center bg-black text-[15px] font-bold text-white"
      >
        立て替えたお金を記録する
      </button>
      <Link
        className="mt-3 grid h-12 place-items-center border border-black text-sm font-bold"
        to="/records"
      >
        出金記録を確認する
      </Link>
      <PaymentDialog ref={paymentDialogRef} />
    </Screen>
  );
}
