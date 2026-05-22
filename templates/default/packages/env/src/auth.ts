import { envSchema } from "./_schema";

const envAuthSchema = envSchema.pick({
	BETTER_AUTH_URL: true,
	BETTER_AUTH_SECRET: true,
	AUTH_DB_URL: true,
	AUTH_TABLE_NAME: true,
});

const envAuthParse = () => ({
	...envAuthSchema.parse(process.env),
	isDev: process.env.NODE_ENV === "development",
});

let envAuth: ReturnType<typeof envAuthParse> | undefined;

export const getEnvAuth = () => {
	envAuth ??= envAuthParse();
	return envAuth;
};
