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

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' http://localhost:* ws://localhost:* https: http:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
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
