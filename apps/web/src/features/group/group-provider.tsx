import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { GroupContext } from "@/features/group/group-context";
import { groupQueries } from "@/features/group/queries";

export function GroupProvider({ children }: { children: ReactNode }) {
  const query = useQuery(groupQueries.me());
  const currentUser = query.data ?? null;

  return (
    <GroupContext.Provider
      value={{
        currentUser,
        currentGroup: currentUser?.groups[0] ?? null,
        errorMessage: query.error?.message ?? null,
        isLoading: query.isPending,
        refresh: async () => {
          await query.refetch();
        },
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}
