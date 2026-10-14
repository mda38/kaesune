import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { AllocationView } from "@/features/allocation/utils/allocations";

type Props = {
  allocations: AllocationView[];
  currentMemberId: string;
  onAmountChange: (memberId: string, amount: string) => void;
};

export function MemberAllocationList({
  allocations,
  currentMemberId,
  onAmountChange,
}: Props) {
  return (
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
                onAmountChange(member.id, event.target.value)
              }
              pattern="[0-9]*"
              type="text"
              value={amount}
            />
          </label>
        </div>
      ))}
    </Card>
  );
}
