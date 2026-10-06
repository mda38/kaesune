import { useContext } from "react";
import { GroupContext } from "./group-context";

export function useGroupContext() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroupContext must be used within GroupProvider.");
  }
  return context;
}
