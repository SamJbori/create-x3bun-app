import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { getRouter } from "./router";

// biome-ignore lint/style/noNonNullAssertion: <It's OK>
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<RouterProvider router={getRouter()} />
		</React.StrictMode>,
	);
}
