import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import biomePlugin from "vite-plugin-biome";

const config = defineConfig({
	ssr: {
		target: "node",
		optimizeDeps: {
			include: ["@tanstack/react-router/ssr/server"],
		},
	},
	envDir: "../../",
	envPrefix: "X3BUN",
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tailwindcss(),
		// tanstackStart({
		// 	srcDirectory: "./app",
		// 	// "dev": { "ssrStyles": { "enabled": true, } }
		// }),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./app/routes",
			generatedRouteTree: "./app/routeTree.gen.ts",
		}),
		viteReact(),
		biomePlugin({
			mode: "lint",
			files: ".",
			applyFixes: true,
			failOnError: true,
			forceColor: true,
		}),
	],
});

export default config;
