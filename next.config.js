import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static optimization to avoid build errors with dynamic routes
  output: 'standalone',
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
  serverExternalPackages: ["@prisma/client"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },
  poweredByHeader: false,
  compress: true,
  env: {
    // Ajout de la variable d'environnement pour canvas
    CANVAS_PREBUILT_LOCATION: "/vercel/path0/node_modules/canvas/prebuilds",
  },
};

module.exports = nextConfig;
