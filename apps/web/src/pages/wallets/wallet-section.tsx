import type { Wallet } from "@/features/wallet/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

type Props = {
  title: string;
  wallets: Wallet[];
  ownerNameById?: Map<string, string>;
  deletingWalletId: string | null;
  onDelete: (wallet: Wallet) => void;
};

export function WalletSection({
  title,
  wallets,
  ownerNameById,
  deletingWalletId,
  onDelete,
}: Props) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-[15px] font-bold">{title}</h2>
      <Card>
        {wallets.length === 0 ? (
          <p className="p-4 text-sm text-neutral-600">まだ財布はありません。</p>
        ) : (
          wallets.map((wallet) => (
            <div
              className="flex min-h-[73px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0"
              key={wallet.id}
            >
              <span className="grid size-10 place-items-center bg-neutral-100 text-black">
                <Icon name="wallet" />
              </span>
              <div className="flex-1">
                <b className="block text-sm">{wallet.name}</b>
                <small className="block text-xs text-neutral-600">
                  {wallet.ownerType === "shared"
                    ? "グループ共有"
                    : `${ownerNameById?.get(wallet.ownerMemberId ?? "") ?? "不明"}の個人財布`}
                </small>
              </div>
              <Badge>公開中</Badge>
              <button
                type="button"
                aria-label={`${wallet.name}を削除`}
                onClick={() => onDelete(wallet)}
                disabled={deletingWalletId === wallet.id}
                className="shrink-0 text-sm font-bold underline disabled:cursor-not-allowed disabled:text-neutral-400"
              >
                {deletingWalletId === wallet.id ? "削除中…" : "削除"}
              </button>
            </div>
          ))
        )}
      </Card>
    </section>
  );
}
