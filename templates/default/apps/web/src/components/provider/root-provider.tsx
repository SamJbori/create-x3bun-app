import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@x3bun/api";
import type { ReactNode } from "react";
import SuperJSON from "superjson";
import { TRPCProvider } from "#/lib/trpc";

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    return `http://localhost:${3000}`; // replace with env.X3BUN_BE_URL for unproxied access
  })();
  return `${base}/api/v0.1`;
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      transformer: SuperJSON,
      url: getUrl(),
    }),
  ],
});

export const getContext = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: SuperJSON.serialize },
      hydrate: { deserializeData: SuperJSON.deserialize },
    },
  });

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });
  const context = {
    queryClient,
    trpc: serverHelpers,
    trpcClient,
  };

  return context;
};

export const TanstackQueryProvider = ({
  children,
  context,
}: {
  children: ReactNode;
  context: ReturnType<typeof getContext>;
}) => {
  const { queryClient } = context;

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  );
};
