import { z } from "zod/v4";

export const envSchema = z.object({
	// SERVER_TOKEN: z.string(),
	X3BUN_BE_URL: z.url(),
});

export const env = {
	...envSchema.parse(import.meta.env),
	isDev: import.meta.env.DEV,
};
