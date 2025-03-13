import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "@fullcalendar/core",
    "@fullcalendar/react",
    "@fullcalendar/daygrid",
    "@fullcalendar/timegrid",
    "@fullcalendar/interaction",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
    domains: ["image.mux.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    serverActions: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Désactive les dépendances inutiles
      canvas: false,
      "utf-8-validate": false,
      bufferutil: false,
      encoding: false,
      punycode: false,
    };

    return config;
  },
};

module.exports = nextConfig;
