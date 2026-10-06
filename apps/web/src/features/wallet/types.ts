export type Wallet = {
  id: string;
  groupId: string;
  ownerMemberId: string | null;
  name: string;
  ownerType: "personal" | "shared";
  createdAt: string;
  updatedAt: string;
};

export type CreateWalletInput = {
  name: string;
  ownerType: Wallet["ownerType"];
  ownerMemberId?: string;
};
