import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { createQueryClient } from "@/lib/query-client";

// RequireSession の userId key ごとに独立したキャッシュを作る。
export function AuthenticatedQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [queryClient] = useState(() =>
    createQueryClient(() => {
      setIsUnauthenticated(true);
    }),
  );

  useEffect(() => () => queryClient.clear(), [queryClient]);

  if (isUnauthenticated)
    return <Navigate to="/?reason=session-expired" replace />;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
