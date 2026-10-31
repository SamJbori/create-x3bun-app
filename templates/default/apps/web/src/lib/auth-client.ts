import type { Auth } from "@x3bun/auth";
import {
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  //   baseURL: "env.X3BUN_BE_URL", // Uncomment this for direct
  basePath: "/api/auth",
  plugins: [inferAdditionalFields<Auth>(), phoneNumberClient()],
  fetchOptions: {
    credentials: "include",
  },
});
