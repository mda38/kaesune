import { useDeleteWalletMutation } from "@/features/wallet/queries/use-delete-wallet-mutation";
import { WalletSection } from "@/features/wallet/components/wallet-section";
import type { Wallet } from "@/features/wallet/types/wallet";
import { Card } from "@/components/ui/card";

type Props = {
  groupId: string;
  wallets: Wallet[];
  ownerNameById: Map<string, string>;
};

export function WalletList({ groupId, wallets, ownerNameById }: Props) {
  const deleteMutation = useDeleteWalletMutation();
  const deleteError = deleteMutation.error?.message ?? null;
  const deletingWalletId = deleteMutation.isPending
    ? deleteMutation.variables.walletId
    : null;
  const deleteWallet = (wallet: Wallet) => {
    if (deleteMutation.isPending) return;
    if (!window.confirm(`「${wallet.name}」を削除しますか？`)) return;
    deleteMutation.mutate({ groupId, walletId: wallet.id });
  };

  const sharedWallets = wallets.filter(
    (wallet) => wallet.ownerType === "shared",
  );
  const personalWallets = wallets.filter(
    (wallet) => wallet.ownerType === "personal",
  );
  return (
    <>
      {deleteError && (
        <Card className="mb-4 p-4">
          <p className="text-sm" role="alert">
            {deleteError}
          </p>
        </Card>
      )}
      <WalletSection
        title="共有財布"
        wallets={sharedWallets}
        deletingWalletId={deletingWalletId}
        onDelete={(wallet) => void deleteWallet(wallet)}
      />
      <WalletSection
        title="個人財布"
        wallets={personalWallets}
        ownerNameById={ownerNameById}
        deletingWalletId={deletingWalletId}
        onDelete={(wallet) => void deleteWallet(wallet)}
      />
    </>
  );
}
