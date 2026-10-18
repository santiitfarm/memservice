// Copies the remote Atlas DB into the local Docker MongoDB (read-only on Atlas).
// WARNING: this overwrites local collections and brings real customer data to your machine.
import { spawnSync } from "node:child_process";
import { root } from "./_env.mjs";

const src = process.env.ATLAS_MONGODB_URI;
if (!src) throw new Error("ATLAS_MONGODB_URI is not set in .env");
if (process.argv[2] !== "--yes") {
  console.error("Refusing to run without confirmation. Re-run:  pnpm db:pull-atlas -- --yes");
  process.exit(1);
}

const sh = `mongodump --uri="$SRC" --archive --quiet | mongorestore --uri="mongodb://mongo:27017/?directConnection=true" --archive --drop --nsFrom='memservice.*' --nsTo='memservice.*' --quiet`;
const r = spawnSync(
  "docker",
  ["run", "--rm", "-i", "--network", "memservice_default", "-e", `SRC=${src}`, "mongo:7", "sh", "-c", sh],
  { stdio: "inherit", cwd: root }
);
process.exit(r.status ?? 1);
