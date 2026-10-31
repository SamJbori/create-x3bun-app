import { initAuth } from "@x3bun/auth";
import { getEnvAuth } from "@x3bun/env";

const env = getEnvAuth();

export const getAuthPromise = () =>
  initAuth({
    cfTurnstileKey: env.CF_TURNSTILE_SECRET_KEY,
    otpSend: async (data) => {
      // SMS sending logic
      console.log(data);
    },
    domain: env.DOMAIN_NAME,
  });
