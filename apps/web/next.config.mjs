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
    domains: ["imgur.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enovathemes.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
      {
        protocol: 'https',
        hostname: "img.icons8.com",
        port: '',
      },
      {
        protocol: 'https',
        hostname: "doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com",
        port: '',
      },
    ],
  },
};

export default nextConfig;
