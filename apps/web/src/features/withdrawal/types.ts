export type Withdrawal = {
  id: string;
  groupId: string;
  walletId: string;
  purpose: string;
  amount: string;
  withdrawnOn: string;
  note: string | null;
  status: "unallocated" | "allocated" | "claimed" | "settled";
  createdAt: string;
  updatedAt: string;
  allocations: { memberId: string; amount: string }[];
};

export type CreateWithdrawalInput = {
  walletId: string;
  purpose: string;
  amount: string;
  withdrawnOn: string;
  note?: string | null;
};
