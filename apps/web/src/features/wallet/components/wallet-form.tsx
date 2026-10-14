import { useState, type FormEvent } from "react";
import { useCreateWalletMutation } from "@/features/wallet/queries/use-create-wallet-mutation";
import type { Wallet } from "@/features/wallet/types/wallet";
import { Card } from "@/components/ui/card";

type Props = {
  groupId: string;
  members: { id: string; name: string }[];
};

export function WalletForm({ groupId, members }: Props) {
  const createMutation = useCreateWalletMutation();
  const isCreating = createMutation.isPending;
  const [name, setName] = useState("");
  const [ownerType, setOwnerType] = useState<Wallet["ownerType"]>("shared");
  const [ownerMemberId, setOwnerMemberId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const createError = validationError ?? createMutation.error?.message ?? null;

  const createWallet = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;
    const trimmedName = name.trim();
    createMutation.reset();
    if (!trimmedName) {
      setValidationError("財布名を入力してください。");
      return;
    }
    if (ownerType === "personal" && !ownerMemberId) {
      setValidationError("所有者を選択してください。");
      return;
    }
    setValidationError(null);
    createMutation.mutate(
      {
        groupId,
        input: {
          name: trimmedName,
          ownerType,
          ...(ownerType === "personal" ? { ownerMemberId } : {}),
        },
      },
      {
        onSuccess: () => {
          setName("");
          setOwnerType("shared");
          setOwnerMemberId("");
        },
      },
    );
  };

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-[15px] font-bold">財布を追加</h2>
      <Card className="p-4">
        <form onSubmit={createWallet} className="space-y-4">
          <label className="block text-sm font-bold">
            <span className="mb-2 block">財布名</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full border border-black px-4 font-normal outline-none"
              maxLength={100}
              disabled={isCreating}
            />
          </label>
          <label className="block text-sm font-bold">
            <span className="mb-2 block">種類</span>
            <select
              value={ownerType}
              onChange={(event) => {
                const nextOwnerType = event.target.value as Wallet["ownerType"];
                setOwnerType(nextOwnerType);
                if (nextOwnerType === "shared") setOwnerMemberId("");
              }}
              className="h-12 w-full border border-black bg-white px-4 font-normal outline-none"
              disabled={isCreating}
            >
              <option value="shared">共有財布</option>
              <option value="personal">個人財布</option>
            </select>
          </label>
          {ownerType === "personal" && (
            <label className="block text-sm font-bold">
              <span className="mb-2 block">所有者</span>
              <select
                value={ownerMemberId}
                onChange={(event) => setOwnerMemberId(event.target.value)}
                className="h-12 w-full border border-black bg-white px-4 font-normal outline-none"
                disabled={isCreating}
              >
                <option value="">選択してください</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {createError && (
            <p className="text-sm" role="alert">
              {createError}
            </p>
          )}
          <button
            type="submit"
            disabled={isCreating}
            className="grid h-12 w-full place-items-center bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-500"
          >
            {isCreating ? "追加中…" : "財布を追加"}
          </button>
        </form>
      </Card>
    </section>
  );
}
