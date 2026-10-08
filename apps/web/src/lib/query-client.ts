import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/api-client";

export const createQueryClient = (onUnauthenticated: () => void) => {
  const handleError = (error: Error) => {
    if (error instanceof ApiRequestError && error.status === 401) {
      client.clear();
      onUnauthenticated();
    }
  };

  const client = new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          if (error.name === "AbortError") return false;
          if (error instanceof ApiRequestError && error.status < 500)
            return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
  return client;
};
