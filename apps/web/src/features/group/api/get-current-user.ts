import { get } from "@/lib/api-client";
import type { CurrentUser } from "@/features/group/types/group";
export const getCurrentUser = (signal?: AbortSignal) => {
  return get<CurrentUser>("/api/me", signal);
};
