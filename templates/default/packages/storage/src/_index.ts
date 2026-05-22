import { getEnvStorage } from "@x3bun/env";
import { s3 } from "bun";

const _env = getEnvStorage();

export const storage = s3;
