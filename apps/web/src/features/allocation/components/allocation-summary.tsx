import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatYen } from "@/features/allocation/utils/format-yen";

type Props = {
  withdrawalAmount: bigint;
  walletName: string;
  hasValidAllocationAmounts: boolean;
  allocationTotal: bigint;
  remainingAmount: bigint;
};

export function AllocationSummary({
  withdrawalAmount,
  walletName,
  hasValidAllocationAmounts,
  allocationTotal,
  remainingAmount,
}: Props) {
  return (
    <>
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
          <Badge>{walletName}</Badge>
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
    </>
  );
}
