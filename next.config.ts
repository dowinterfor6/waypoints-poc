import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: process.env.NODE_ENV === "development" ? "" : "/waypoints-poc",
  output: "export",
  reactStrictMode: true,
};

export default nextConfig;
