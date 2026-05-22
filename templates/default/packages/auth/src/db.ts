import { getEnvAuth } from "@x3bun/env";
import { type Db, MongoClient } from "mongodb";

const env = getEnvAuth();

let DBClientPromise: Promise<MongoClient> | undefined;
let DB: Db | undefined;

export const getDBPromise = async () => {
	DBClientPromise ??= new MongoClient(env.AUTH_DB_URL).connect();
	DB ??= (await DBClientPromise).db(env.AUTH_TABLE_NAME);
	return DB;
};
