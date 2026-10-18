// Quick health check for the local stack:  pnpm health
import net from "node:net";
import { spawnSync } from "node:child_process";
import mongoose from "mongoose";
import "./_env.mjs";

const ok = (m) => console.log(`  \u2713 ${m}`);
const bad = (m) => { console.log(`  \u2717 ${m}`); failed = true; };
let failed = false;

console.log("Tooling");
const major = Number(process.versions.node.split(".")[0]);
major >= 20 ? ok(`node ${process.versions.node}`) : bad(`node ${process.versions.node} (need >= 20.9)`);
const docker = spawnSync("docker", ["info", "--format", "{{.ServerVersion}}"], { encoding: "utf8" });
docker.status === 0 ? ok(`docker engine ${docker.stdout.trim()}`) : bad("docker engine is not running");

console.log("Environment (.env)");
const required = ["MONGODB_CONNECTION_STRING", "AUTH_SECRET", "API_URL", "NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_URL_DEV", "NEXT_PUBLIC_APP_URL_FRONTEND"];
const optional = ["CLOUDINARY_API_KEY", "AUTH_GOOGLE_ID", "RESEND_API_KEY", "BKASH_APP_KEY", "CORS_ALLOWED_ORIGINS"];
for (const k of required) process.env[k] ? ok(k) : bad(`${k} is missing`);
for (const k of optional) process.env[k] ? ok(`${k} (optional)`) : console.log(`  - ${k} not set (feature disabled)`);

console.log("MongoDB");
try {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { serverSelectionTimeoutMS: 4000 });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  ok(`connected (${mongoose.connection.name})`);
  hello.setName ? ok(`replica set ${hello.setName} (transactions available)`) : bad("not a replica set - order transactions will fail");
  const users = await mongoose.connection.db.collection("users").countDocuments();
  users > 0 ? ok(`${users} admin user(s)`) : bad("no admin user - run: pnpm db:seed");
  await mongoose.disconnect();
} catch (e) {
  bad(`cannot connect: ${e.message}`);
}

console.log("Ports (informational)");
for (const [name, port] of [["web", 3000], ["api", 3001], ["admin", 3002]]) {
  const up = await new Promise((r) => {
    const s = net.connect(port, "127.0.0.1").once("connect", () => { s.end(); r(true); }).once("error", () => r(false));
  });
  console.log(`  ${up ? "\u25CF running " : "\u25CB free    "} ${name} :${port}`);
}

process.exit(failed ? 1 : 0);
