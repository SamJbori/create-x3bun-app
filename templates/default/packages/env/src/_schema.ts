import { z } from "zod/v4";

export const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),

	/** Better-Auth - Automatically read by the instance */
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),

	/** Use MongoDB for Auth DB, or not, I don't care */
	AUTH_DB_URL: z.url(),
	AUTH_TABLE_NAME: z.string(),

	DATABASE_URL: z.url(),

	/** Storage - Automatically Read by Bun.s3 default instance */
	S3_ENDPOINT: z.url().nullish(),
	S3_REGION: z.string(),
	S3_ACCESS_KEY_ID: z.string(),
	S3_SECRET_ACCESS_KEY: z.string(),

	/** Server to Server API Call Token */
	SERVER_TOKEN: z.string(),

	/** Turnstile because you should */
	CF_TURNSTILE_SECRET_KEY: z.string(),
});
