import { get } from "../../lib/api-client";
import type { CurrentUser, GroupMember } from "./types";

export type { CurrentUser, Group, GroupMember } from "./types";

export function getCurrentUser(signal?: AbortSignal) {
  return get<CurrentUser>("/api/me", signal);
}

export async function getGroupMembers(groupId: string, signal?: AbortSignal) {
  const response = await get<{ members: GroupMember[] }>(
    `/api/groups/${groupId}/members`,
    signal,
  );
  return response.members;
}
