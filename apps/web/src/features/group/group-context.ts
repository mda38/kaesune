import { createContext } from "react";
import type { CurrentUser, Group } from "./types";

export type GroupContextValue = {
  currentGroup: Group | null;
  currentUser: CurrentUser | null;
  errorMessage: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export const GroupContext = createContext<GroupContextValue | null>(null);
