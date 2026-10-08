import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { walletQueries } from "../../features/wallet/queries";
import { groupQueries } from "../../features/group/queries";
import {
  useCreateWallet,
  useDeleteWallet,
} from "../../features/wallet/mutations";
import { QueryErrorNotice } from "../../components/ui/QueryErrorNotice";
import type { Wallet } from "../../features/wallet/types";
import { Heading, Screen } from "../../layouts";
import { Badge, Card, Icon } from "../../components/ui";
import { useGroupContext } from "../../features/group/useGroupContext";

export function WalletsPage() {
  const { currentGroup, errorMessage, isLoading, refresh } = useGroupContext();
  const walletsQuery = useQuery(walletQueries.list(currentGroup?.id));
  const membersQuery = useQuery(groupQueries.members(currentGroup?.id));
  const wallets = walletsQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const isDataLoading =
    Boolean(currentGroup) && (walletsQuery.isPending || membersQuery.isPending);
  const dataError =
    walletsQuery.error?.message ?? membersQuery.error?.message ?? null;
  const hasData =
    walletsQuery.data !== undefined && membersQuery.data !== undefined;
  const refreshWalletData = async () => {
    await Promise.all([walletsQuery.refetch(), membersQuery.refetch()]);
  };
  const createMutation = useCreateWallet();
  const deleteMutation = useDeleteWallet();
  const isCreating = createMutation.isPending;
  const deleteError = deleteMutation.error?.message ?? null;
  const deletingWalletId = deleteMutation.isPending
    ? deleteMutation.variables.walletId
    : null;
  const [name, setName] = useState("");
  const [ownerType, setOwnerType] = useState<Wallet["ownerType"]>("shared");
  const [ownerMemberId, setOwnerMemberId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const createError = validationError ?? createMutation.error?.message ?? null;

  const createWallet = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGroup || isCreating) return;
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
        groupId: currentGroup.id,
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

  const deleteWallet = (wallet: Wallet) => {
    if (!currentGroup || deleteMutation.isPending) return;
    if (!window.confirm(`「${wallet.name}」を削除しますか？`)) return;
    deleteMutation.mutate({ groupId: currentGroup.id, walletId: wallet.id });
  };

  const sharedWallets = wallets.filter(
    (wallet) => wallet.ownerType === "shared",
  );
  const personalWallets = wallets.filter(
    (wallet) => wallet.ownerType === "personal",
  );
  const ownerNameById = new Map(
    members.map((member) => [member.id, member.name]),
  );

  return (
    <Screen active="mypage">
      <Heading
        eyebrow={currentGroup?.name ?? "支払い元と返済先"}
        title="財布管理"
      />
      <QueryErrorNotice
        message={currentGroup ? errorMessage : null}
        onRetry={refresh}
      />
      <QueryErrorNotice
        message={hasData ? dataError : null}
        onRetry={refreshWalletData}
      />
      {isLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            グループ情報を取得中です…
          </p>
        </Card>
      ) : !currentGroup ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {errorMessage ?? "現在、所属しているグループはありません。"}
          </p>
          {errorMessage && (
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-3 text-sm font-bold underline"
            >
              再試行
            </button>
          )}
        </Card>
      ) : isDataLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            財布情報を取得中です…
          </p>
        </Card>
      ) : dataError && !hasData ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {dataError}
          </p>
          <button
            type="button"
            onClick={() => void refreshWalletData()}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : (
        <>
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
                      const nextOwnerType = event.target
                        .value as Wallet["ownerType"];
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
      )}
    </Screen>
  );
}

function WalletSection({
  title,
  wallets,
  ownerNameById,
  deletingWalletId,
  onDelete,
}: {
  title: string;
  wallets: Wallet[];
  ownerNameById?: Map<string, string>;
  deletingWalletId: string | null;
  onDelete: (wallet: Wallet) => void;
}) {
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
