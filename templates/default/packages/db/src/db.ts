import { getEnvDB } from "@x3bun/env";
import { dbNames } from "@x3bun/validators";
import { MongoClient } from "mongodb";

const env = getEnvDB();

const DBClientPromise = Object.fromEntries(
  Object.keys(dbNames).map((key) => [key, undefined]),
) as Record<keyof typeof dbNames, Promise<MongoClient> | undefined>;

export const getDBClientPromise = async (
  dbName: keyof typeof dbNames = "main",
) => {
  let DB_URL = env.DATABASE_URL;
  switch (dbName) {
    case "auth":
      DB_URL = env.AUTH_DB_URL;
      break;
  }
  DBClientPromise[dbName] ??= new MongoClient(DB_URL).connect();
  return DBClientPromise[dbName];
};
