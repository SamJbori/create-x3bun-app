import { envSchema } from "./_schema";

const envDBSchema = envSchema.pick({ DATABASE_URL: true });

const envDBParse = () => ({
	...envDBSchema.parse(process.env),
	isDev: process.env.NODE_ENV === "development",
});

let envDB: ReturnType<typeof envDBParse> | undefined;

export const getEnvDB = () => {
	envDB ??= envDBParse();
	return envDB;
};
