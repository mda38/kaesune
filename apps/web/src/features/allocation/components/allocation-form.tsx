import type { GroupMember } from "@/features/group/types/group";
import type { Withdrawal } from "@/features/withdrawal/types/withdrawal";
import type { Wallet } from "@/features/wallet/types/wallet";
import { useAllocationForm } from "@/features/allocation/hooks/use-allocation-form";
import { useCreateWithdrawalClaimsMutation } from "@/features/allocation/queries/use-create-withdrawal-claims-mutation";
import { summarizeAllocations } from "@/features/allocation/utils/allocations";
import { AllocationSummary } from "@/features/allocation/components/allocation-summary";
import { MemberAllocationList } from "@/features/allocation/components/member-allocation-list";
import { ClaimPreview } from "@/features/allocation/components/claim-preview";

type Props = {
  groupId: string;
  currentMemberId: string;
  withdrawal: Withdrawal;
  members: GroupMember[];
  wallet: Wallet;
  onCreated: () => void;
};

export function AllocationForm({
  groupId,
  currentMemberId,
  withdrawal,
  members,
  wallet,
  onCreated,
}: Props) {
  const {
    allocations,
    selectedPreset,
    applyEqualPreset,
    applyFullAmountPreset,
    updateAllocationAmount,
  } = useAllocationForm(withdrawal, members);
  const createMutation = useCreateWithdrawalClaimsMutation();
  const isCreatingClaims = createMutation.isPending;
  const claimCreateError = createMutation.error?.message ?? null;
  const withdrawalAmount = BigInt(withdrawal.amount);
  const {
    hasValidAllocationAmounts,
    allocationTotal,
    remainingAmount,
    claimTargets,
    canCreateClaims,
  } = summarizeAllocations(withdrawalAmount, allocations, wallet);
  const createClaims = () => {
    if (isCreatingClaims || !canCreateClaims) return;
    createMutation.mutate(
      {
        groupId,
        withdrawalId: withdrawal.id,
        allocations: allocations.map(({ member, amount }) => ({
          memberId: member.id,
          amount,
        })),
      },
      { onSuccess: onCreated },
    );
  };

  return (
    <article>
      <AllocationSummary
        withdrawalAmount={withdrawalAmount}
        walletName={wallet.name}
        hasValidAllocationAmounts={hasValidAllocationAmounts}
        allocationTotal={allocationTotal}
        remainingAmount={remainingAmount}
      />
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
      <MemberAllocationList
        allocations={allocations}
        currentMemberId={currentMemberId}
        onAmountChange={updateAllocationAmount}
      />
      <ClaimPreview claimTargets={claimTargets} walletName={wallet.name} />
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
