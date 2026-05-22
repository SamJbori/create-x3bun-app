import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import "../styles.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Context } from "../router";

const createContextRootRoute = createRootRouteWithContext<Context>();

export const Route = createContextRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<Outlet />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					{
						name: "Tanstack Query",
						render: <ReactQueryDevtools />,
					},
				]}
			/>
		</>
	);
}
