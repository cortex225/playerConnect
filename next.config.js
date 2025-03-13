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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Désactive canvas et ses dépendances côté client
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        "@vercel/og": false,
      };
    }

    // Désactive les dépendances problématiques globalement
    config.resolve.alias = {
      ...config.resolve.alias,
      "utf-8-validate": false,
      bufferutil: false,
      "canvas-prebuilt": false,
      "canvas-node": false,
      encoding: false,
    };

    return config;
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
