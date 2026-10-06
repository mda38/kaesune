import { get } from "../../lib/api-client";
import type { CurrentUser, GroupMember } from "./types";

export type { CurrentUser, Group, GroupMember } from "./types";

export function getCurrentUser() {
  return get<CurrentUser>("/api/me");
}

export async function getGroupMembers(groupId: string) {
  const response = await get<{ members: GroupMember[] }>(
    `/api/groups/${groupId}/members`,
  );
  return response.members;
}
