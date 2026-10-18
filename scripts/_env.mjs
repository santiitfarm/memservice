import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root, true, { info() {}, error: console.error });
