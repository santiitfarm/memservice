import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

// Single source of truth: load the monorepo root .env for this app.
nextEnv.loadEnvConfig(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  process.env.NODE_ENV !== "production",
  console,
  true // forceReload: Next already loaded the app dir's env once
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dummyjson.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "d61s2hjse0ytn.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "photo.teamrabbil.com",
      },
      {
        protocol: "https",
        hostname: "securepay.sslcommerz.com",
      },
    ],
  },
};

export default nextConfig;
