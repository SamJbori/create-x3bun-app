import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type { ReactNode } from "react";
import {
  getContext,
  TanstackQueryProvider,
} from "#/components/provider/root-provider";
import { routeTree } from "./routeTree.gen";

const Wrap = ({ children }: { children: ReactNode }) => {
  return (
    <TanstackQueryProvider context={getContext()}>
      {children}
    </TanstackQueryProvider>
  );
};

export const getRouter = () => {
  const context = getContext();

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,

    Wrap,
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
