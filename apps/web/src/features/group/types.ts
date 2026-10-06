export type Group = { id: string; name: string; memberId: string };

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  groups: Group[];
};

export type GroupMember = {
  id: string;
  name: string;
  role: "owner" | "member";
  avatarUrl: string | null;
};
