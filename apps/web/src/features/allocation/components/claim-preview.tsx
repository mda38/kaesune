import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  parseAllocationAmount,
  type AllocationView,
} from "@/features/allocation/utils/allocations";
import { formatYen } from "@/features/allocation/utils/format-yen";

type Props = { claimTargets: AllocationView[]; walletName: string };

export function ClaimPreview({ claimTargets, walletName }: Props) {
  return (
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
                  {walletName}への返済
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
  );
}
