import { get } from "@/lib/api-client";
import type { GroupMember } from "@/features/group/types/group";
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
