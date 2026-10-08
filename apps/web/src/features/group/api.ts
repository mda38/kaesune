import { get } from "../../lib/api-client";
import type { CurrentUser, GroupMember } from "./types";

export type { CurrentUser, Group, GroupMember } from "./types";

export const getCurrentUser = (signal?: AbortSignal) => {
  return get<CurrentUser>("/api/me", signal);
};

export const getGroupMembers = async (
  groupId: string,
  signal?: AbortSignal,
) => {
  const response = await get<{ members: GroupMember[] }>(
    `/api/groups/${groupId}/members`,
    signal,
  );
  return response.members;
};
