import type { Withdrawal } from "@/features/withdrawal/types";
import { Link } from "react-router-dom";

type Props = {
  withdrawals: Withdrawal[];
  walletNameById: Map<string, string>;
};

export function WithdrawalList({ withdrawals, walletNameById }: Props) {
  return (
    <div>
      {withdrawals.map((withdrawal) => (
        <Link
          className="flex min-h-[70px] items-start justify-between py-2.5 text-black"
          key={withdrawal.id}
          to={`/records/${withdrawal.id}`}
        >
          <div className="min-w-0 pr-4">
            <b className="block text-base leading-6">
              {walletNameById.get(withdrawal.walletId) ?? "不明な財布"}
            </b>
            <small className="block text-[13px] leading-5 text-neutral-500">
              {withdrawal.withdrawnOn.replaceAll("-", "/")} ・{" "}
              {withdrawal.purpose}
            </small>
          </div>
          <strong className="shrink-0 text-base leading-6">
            ¥{BigInt(withdrawal.amount).toLocaleString("ja-JP")}
          </strong>
        </Link>
      ))}
    </div>
  );
}
