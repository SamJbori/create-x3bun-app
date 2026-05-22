import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { getQueryClient } from "../src/lib/query";
import { api, getTRPCClient, trpc } from "../src/lib/trpc";
import { routeTree } from "./routeTree.gen";

export type Context = {
	trpc: typeof trpc;
	queryClient: ReturnType<typeof getQueryClient>;
};

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		context: {
			trpc,
			queryClient: getQueryClient(),
		},
		Wrap: ({ children }) => {
			return (
				<QueryClientProvider client={getQueryClient()}>
					<api.Provider client={getTRPCClient()} queryClient={getQueryClient()}>
						{children}
					</api.Provider>
				</QueryClientProvider>
			);
		},
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
