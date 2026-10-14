import { useCurrentUserQuery } from "@/features/group/queries/use-current-user-query";
import { type ReactNode } from "react";
import { GroupContext } from "@/features/group/contexts/group-context";

type Props = { children: ReactNode };

export function GroupProvider({ children }: Props) {
  const query = useCurrentUserQuery();
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
