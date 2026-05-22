import { getEnvDB } from "@x3bun/env";
import { defineConfig } from "drizzle-kit";

const env = getEnvDB();

export default defineConfig({
	schema: "./src/drizzle/schema.ts",
	out: "./src/drizzle/out",
	dialect: "postgresql",
	dbCredentials: {
		url: `${env.DATABASE_URL}&uselibpqcompat=true`,
	},
	verbose: env.isDev,
	strict: env.isDev,
});
