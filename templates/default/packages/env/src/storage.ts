import { envSchema } from "./_schema";

const envStorageSchema = envSchema.pick({
	S3_ACCESS_KEY_ID: true,
	S3_SECRET_ACCESS_KEY: true,
	S3_REGION: true,
	S3_ENDPOINT: true,
});

const envStorageParse = () => ({
	...envStorageSchema.parse(process.env),
	isDev: process.env.NODE_ENV === "development",
});

let envStorage: ReturnType<typeof envStorageParse> | undefined;

export const getEnvStorage = () => {
	envStorage ??= envStorageParse();
	return envStorage;
};
