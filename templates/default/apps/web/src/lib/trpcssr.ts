import "server-only";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@x3bun/api";
import SuperJSON from "superjson";
import { env } from "./env";

export const trpcssr = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${env.X3BUN_BE_URL}/v0.1`,
			transformer: SuperJSON,
			headers: () => {
				const headers = new Headers();
				headers.set("x-trpc-source", "rsc");
				headers.set("X-Server-Token", import.meta.env.SERVER_TOKEN);
				return headers;
			},
		}),
	],
});
