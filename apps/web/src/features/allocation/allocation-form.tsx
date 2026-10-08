import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GroupMember } from "@/features/group/types";
import type { Withdrawal } from "@/features/withdrawal/types";
import type { Wallet } from "@/features/wallet/types";
import { parseAllocationAmount } from "@/features/allocation/domain";
import { useAllocationForm } from "@/features/allocation/use-allocation-form";

type Props = {
  withdrawal: Withdrawal;
  members: GroupMember[];
  wallet: Wallet;
  groupId: string;
  currentMemberId: string;
};
export function AllocationForm({
  withdrawal,
  members,
  wallet,
  groupId,
  currentMemberId,
}: Props) {
  const navigate = useNavigate();
  const {
    allocations,
    selectedPreset,
    withdrawalAmount,
    hasValidAllocationAmounts,
    allocationTotal,
    remainingAmount,
    claimTargets,
    canCreateClaims,
    isCreatingClaims,
    claimCreateError,
    createClaims,
    applyEqualPreset,
    applyFullAmountPreset,
    updateAllocationAmount,
  } = useAllocationForm(withdrawal, members, wallet, groupId, () =>
    navigate("/invoices"),
  );
  return (
    <article>
      <Card className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center p-5">
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500">出金額</p>
          <strong className="text-2xl tracking-[-0.03em]">
            {formatYen(withdrawalAmount)}
          </strong>
        </div>
        <span className="mx-5 h-16 w-px bg-black" aria-hidden="true" />
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500">支払い元</p>
          <Badge>{wallet.name}</Badge>
        </div>
      </Card>
      <Card className="mb-4 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold">負担額の合計</p>
            <strong className="text-xl">
              {hasValidAllocationAmounts
                ? formatYen(allocationTotal)
                : "入力してください"}
            </strong>
          </div>
          <p className="text-sm font-bold">
            残り&nbsp;{" "}
            {hasValidAllocationAmounts ? formatYen(remainingAmount) : "—"}
          </p>
        </div>
      </Card>
      <div
        aria-label="負担配分プリセット"
        className="mb-4 flex gap-2 overflow-x-auto pb-1"
      >
        <button
          aria-pressed={selectedPreset === "equal"}
          className="h-11 shrink-0 border border-accent bg-white px-4 text-xs font-bold text-accent"
          onClick={applyEqualPreset}
          type="button"
        >
          ＝ 均等にする
        </button>
        {members.map((member) => (
          <button
            aria-pressed={selectedPreset === member.id}
            className="h-11 shrink-0 border border-black bg-white px-4 text-xs font-bold text-black"
            key={member.id}
            onClick={() => applyFullAmountPreset(member.id)}
            type="button"
          >
            {member.name}が全額
          </button>
        ))}
      </div>
      <Card>
        {allocations.map(({ member, amount }, index) => (
          <div
            className={`flex min-h-20 items-center gap-3 p-4 ${index < allocations.length - 1 ? "border-b border-black" : ""}`}
            key={member.id}
          >
            <Avatar name={member.name} />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-sm">{member.name}</b>
              {member.id === currentMemberId && (
                <small className="block text-xs text-neutral-600">あなた</small>
              )}
            </div>
            <label className="flex min-w-32 items-center gap-2 border border-black px-4 py-3 text-sm">
              <span>¥</span>
              <input
                aria-label={`${member.name}の負担額`}
                className="min-w-0 flex-1 bg-transparent text-right font-bold outline-none"
                inputMode="numeric"
                min="0"
                onChange={(event) =>
                  updateAllocationAmount(member.id, event.target.value)
                }
                pattern="[0-9]*"
                type="text"
                value={amount}
              />
            </label>
          </div>
        ))}
      </Card>
      <Card className="mt-5 p-4">
        <h2 className="mb-4 text-sm font-bold">発行される請求</h2>
        {claimTargets.length > 0 ? (
          <div className="space-y-4">
            {claimTargets.map(({ member, amount }) => (
              <div className="flex items-center gap-3" key={member.id}>
                <Avatar name={member.name} />
                <div className="min-w-0 flex-1">
                  <b className="block text-sm">
                    {member.name}に {formatYen(parseAllocationAmount(amount)!)}{" "}
                    を請求
                  </b>
                  <small className="block truncate text-xs text-neutral-600">
                    {wallet.name}への返済
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            この配分から発行される請求はありません。
          </p>
        )}
      </Card>
      {claimCreateError && (
        <p className="mt-5 text-sm text-red-600" role="alert">
          {claimCreateError}
        </p>
      )}
      <button
        aria-describedby="claim-issue-note"
        className="mt-5 h-14 w-full bg-black text-base font-bold text-white"
        disabled={isCreatingClaims || !canCreateClaims}
        onClick={() => void createClaims()}
        type="button"
      >
        {isCreatingClaims ? "請求を発行中…" : "請求を発行する"}
      </button>
      <p
        className="mt-4 flex items-start gap-2 text-xs leading-6 text-neutral-600"
        id="claim-issue-note"
      >
        <span
          aria-hidden="true"
          className="mt-1 grid size-4 shrink-0 place-items-center rounded-full border border-accent text-[10px] font-bold text-accent"
        >
          i
        </span>
        <span>
          発行すると、表示中の負担配分を保存して対象メンバーへの請求として記録します。
        </span>
      </p>
    </article>
  );
}
const formatYen = (amount: bigint) => `¥${amount.toLocaleString("ja-JP")}`;
