import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "../features/auth/auth-client";
import { AuthenticatedQueryProvider } from "../features/auth/authenticated-query-provider";
import { GroupProvider } from "../features/group/group-provider";

export function RequireSession() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <main className="min-h-svh bg-white" aria-busy="true" />;
  }
  if (!session) return <Navigate to="/" replace />;

  return (
    <AuthenticatedQueryProvider key={session.user.id}>
      <GroupProvider>
        <Outlet />
      </GroupProvider>
    </AuthenticatedQueryProvider>
  );
}
