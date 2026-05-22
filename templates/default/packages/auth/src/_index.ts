import { getEnvAuth } from "@x3bun/env";
import type { BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth/minimal";
import { anonymous, captcha, openAPI, phoneNumber } from "better-auth/plugins";
import z from "zod/v4";
import { getDBPromise } from "./db";

const env = getEnvAuth();

export const initAuth = async (config: {
	cfTurnstileKey: string;
	otpSend?: (config: {
		phoneNumber: string;
		code: string;
	}) => Promise<undefined>;
	domain?: string;
	roles: string[];
}) => {
	const db = await getDBPromise();

	const ROLE = z.enum(config.roles);

	const authConfig = {
		database: mongodbAdapter(db),
		basePath: "/auth",
		advanced: {
			cookiePrefix: "myrepo",
			useSecureCookies: true,
			crossSubDomainCookies: {
				enabled: true,
				domain: config.domain as unknown as string, // Domain with a leading period
			},
			defaultCookieAttributes: {
				secure: true,
				httpOnly: true,
				sameSite: "none", // Allows CORS-based cookie sharing across subdomains
				partitioned: true, // New browser standards will mandate this for foreign cookies
			},
		},
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
				role: {
					type: "string",
					required: false,
					// Add youe own validator
					validator: { input: ROLE, output: ROLE },
				},
				isDevice: { type: "boolean", required: true, defaultValue: false },
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
				sendOTP: ({ phoneNumber, code }) => {
					config.otpSend?.({ phoneNumber, code });
				},
				expiresIn: 600,
				otpLength: 6,
				phoneNumberValidator: (_phoneNumber) => {
					// return ZPhoneNumber.safeParse(phoneNumber).success;
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
			captcha({
				provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha
				secretKey: config.cfTurnstileKey,
				endpoints: env.isDev ? undefined : ["/phone-number/send-otp"],
			}),
			openAPI({ disableDefaultReference: env.isDev }),
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
