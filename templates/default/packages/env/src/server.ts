import { envSchema } from "./_schema";

const envServerSchema = envSchema.pick({
  BETTER_AUTH_SECRET: true,
  SERVER_TOKEN: true,
  PROXY_SECRET: true,
  // DOMAIN_NAME: true,
});

const envServerParse = () => ({
  ...envServerSchema.parse(process.env),
  isDev: process.env.NODE_ENV === "development",
});

let envServer: ReturnType<typeof envServerParse> | undefined;

export const getEnvServer = () => {
  envServer ??= envServerParse();
  return envServer;
};
