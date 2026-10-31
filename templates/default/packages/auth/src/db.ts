import type { Db } from "@x3bun/db";
import { getDBClientPromise } from "@x3bun/db";
import { getEnvAuth } from "@x3bun/env";

const env = getEnvAuth();

let DB: Db | undefined;

export const getDBPromise = async () => {
  DB ??= (await getDBClientPromise("auth")).db(env.AUTH_TABLE_NAME);
  return DB;
};
