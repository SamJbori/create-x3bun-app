import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  envDir: "../../",
  envPrefix: "X3BUN",
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      routeRules: {
        "/api/**": {
          proxy: {
            // biome-ignore lint: <Using env needed>
            to: `${process.env.X3BUN_BE_URL!}/api/**`,
            headers: {
              // biome-ignore lint: <Using env needed>
              "X-Proxy-Secret": process.env.PROXY_SECRET!,
            },
          },
        },
      },
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "./app",
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;
