import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@x3bun/api";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
