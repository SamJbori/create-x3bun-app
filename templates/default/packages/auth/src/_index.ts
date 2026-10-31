import { getEnvAuth } from "@x3bun/env";
import type { BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth/minimal";
import { anonymous, captcha, openAPI, phoneNumber } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDBPromise } from "./db";

export { getAuthPromise } from "./auth";

const env = getEnvAuth();

export const initAuth = async (config: {
  cfTurnstileKey: string | undefined;
  otpSend: (config: {
    phoneNumber: string;
    code: string;
  }) => Promise<undefined>;
  domain: string | undefined;
}) => {
  const db = await getDBPromise();

  const authConfig = {
    database: mongodbAdapter(db),
    basePath: "/api/auth",
    advanced: config.domain
      ? {
          cookiePrefix: "x3bun",
          useSecureCookies: true,
          crossSubDomainCookies: {
            enabled: true,
            domain: `.${config.domain}`, // Domain with a leading period
          },
          defaultCookieAttributes: {
            secure: true,
            httpOnly: true,
            sameSite: "none", // Allows CORS-based cookie sharing across subdomains
            partitioned: true, // New browser standards will mandate this for foreign cookies
          },
        }
      : undefined,
    trustedOrigins: (request) => {
      // Return an array of trusted origins based on the request
      const origin = request?.headers.get("origin");

      return [origin ?? ""];
    },
    user: {
      additionalFields: {
        phoneNumber: {
          type: "string",
          required: true,
          unique: true,
          // Add your own validator
          // validator: { input: ZPhoneNumber, output: ZPhoneNumber },
        },
        phoneNumberVerified: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        isAnonymous: { type: "boolean", required: false },
        // Use your own logic
        isAdmin: { type: "boolean", required: false },
      },
    },
    plugins: [
      anonymous({
        onLinkAccount({ anonymousUser, newUser }) {
          console.log("AnonymousUser: ", anonymousUser.user.id);
          console.log("NewUser: ", newUser.user.id);
          // do something, like change cart ownership, or likes
        },
      }),
      phoneNumber({
        sendOTP: async ({ phoneNumber, code }) => {
          await config.otpSend({ phoneNumber, code });
        },
        expiresIn: 600,
        otpLength: 6,
        phoneNumberValidator: (_phoneNumber) => {
          return true;
        },
        signUpOnVerification: {
          getTempEmail: (phoneNumber) => {
            return `${phoneNumber}@my.myrepo.com`;
          },
          //optionally, you can also pass `getTempName` function to generate a temporary name for the user
          getTempName: (phoneNumber) => {
            return phoneNumber; //by default, it will use the phone number as the name
          },
        },
      }),
      config.cfTurnstileKey
        ? captcha({
            provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha
            secretKey: config.cfTurnstileKey,
            endpoints: env.isDev ? undefined : ["/phone-number/send-otp"],
          })
        : undefined,
      openAPI({ disableDefaultReference: env.isDev }),
      tanstackStartCookies(),
    ] as BetterAuthOptions["plugins"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth({ ...authConfig });
};
export type Auth = Awaited<ReturnType<typeof initAuth>>;
export type Session = Auth["$Infer"]["Session"]["session"];
export type User = Auth["$Infer"]["Session"]["user"];
export type AuthData = {
  session: Session;
  user: User;
} | null;
