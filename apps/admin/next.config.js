const path = require("node:path");
const { loadEnvConfig } = require("@next/env");

// Single source of truth: load the monorepo root .env for this app.
loadEnvConfig(
  path.resolve(__dirname, "../.."),
  process.env.NODE_ENV !== "production",
  console,
  true // forceReload: Next already loaded the app dir's env once
);

// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/auth/:path*",
  //       destination: "/api/auth/:path*",
  //     },
  //     {
  //       source: "/api/:path*",
  //       destination: "https://kabbomobileshopapi.vercel.app/api/:path*",
  //     },
  //   ];
  // },
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
      {
        protocol: 'https',
        hostname: "doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com",
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
