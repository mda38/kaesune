export type Claim = {
  id: string;
  groupId: string;
  debtorMemberId: string;
  walletId: string;
  amount: string;
  status: "unsettled" | "settled";
  settledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClaimListItem = Claim & {
  debtorMemberName: string;
  walletName: string;
  items: { withdrawalId: string; purpose: string; amount: string }[];
};
