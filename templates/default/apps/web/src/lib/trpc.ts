import {
	type CreateTRPCClientOptions,
	createTRPCClient,
	createTRPCReact,
	httpBatchStreamLink,
	loggerLink,
} from "@trpc/react-query";
import type { AppRouter } from "@x3bun/api";
import SuperJSON from "superjson";
import { env } from "./env";

/** TRPC TanstackQuery */
export const api = createTRPCReact<AppRouter>();

let trpcClientSingleton: ReturnType<typeof api.createClient> | undefined;

const trpcClientConfig: CreateTRPCClientOptions<AppRouter> = {
	links: [
		loggerLink({
			enabled: (op) =>
				env.isDev || (op.direction === "down" && op.result instanceof Error),
		}),
		httpBatchStreamLink({
			transformer: SuperJSON,
			url: `${env.X3BUN_BE_URL}/v0.1`,
			fetch: (url, options) => {
				return fetch(url, {
					...(options as unknown as object),
					credentials: "include",
				});
			},
			headers: () => {
				const headers = new Headers();
				headers.set("x-trpc-source", "react-web");
				return headers;
			},
		}),
	],
};

const createAPITRPCClient = () => api.createClient(trpcClientConfig);

export const getTRPCClient = () => {
	// Server: always make a new query client
	if (typeof window === "undefined") {
		return createAPITRPCClient();
	}
	// Browser: use singleton pattern to keep the same query client
	trpcClientSingleton ??= createAPITRPCClient();

	return trpcClientSingleton;
};

export const trpc = {
	/** Contain React Client Friendly Utilities and hooks */
	api,
	/** Contain tRPC client functions */
	client: createTRPCClient<AppRouter>(trpcClientConfig),
	/** Contains SSR friendly client functions */
};
