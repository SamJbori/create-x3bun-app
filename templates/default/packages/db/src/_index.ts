import { getEnvDB } from "@x3bun/env";
import { sql } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import * as sch from "./drizzle/schema";

const env = getEnvDB();

export const db = drizzle(sql, { schema: sch, logger: env.isDev });

export const schema = sch;
