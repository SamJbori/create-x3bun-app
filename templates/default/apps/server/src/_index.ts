import { trpcServer } from "@hono/trpc-server";
import { appRouter, createTRPCContext } from "@x3bun/api";
import { getAuthPromise } from "@x3bun/auth";
import { dbCollections, getDBClientPromise } from "@x3bun/db";
import { getEnvServer } from "@x3bun/env";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const env = getEnvServer();

const auth = await getAuthPromise();

const db = dbCollections(await getDBClientPromise());

const trpc = trpcServer({
  router: appRouter,
  createContext: async (_, c) => {
    const headers = c.req.raw.headers;
    return createTRPCContext({
      headers,
      authData: await auth.api.getSession({ headers }),
      auth,
      db,
    });
  },
  onError: ({ path, error }) => {
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
  },
});

const app = new Hono();

app.use(logger());

app.use(
  "/*",
  cors({
    origin: (o) => o,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-trpc-source",
      "trpc-accept",
      "x-captcha-response",
      "X-Proxy-Secret",
      "X-Server-Token",
      // Add any other headers you want to allow here
    ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86_400,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const secret = c.req.header("X-Proxy-Secret");

  if (secret !== env.PROXY_SECRET) {
    return c.json({ error: "Unauthorized proxy" }, 401);
  }

  await next();
});

app.use("/api/v0.1/*", trpc);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// catch-all LAST
app.all("*", (c) => {
  return c.json(
    {
      error: "Unimplemented",
      path: c.req.path,
      method: c.req.method,
    },
    501,
  );
});

if (env.isDev) {
  console.log("Running Server in DEV mode...");
  Bun.serve({
    fetch: app.fetch,
    // TBI Enable SSL for cross site cookies if needed
    // tls: {
    // 	key: Bun.file("./certificates/localhost-key.pem"),
    // 	cert: Bun.file("./certificates/localhost.pem"),
    // },
  });
}

export default env.isDev ? null : app;
