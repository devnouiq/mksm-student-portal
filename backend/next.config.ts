import type { NextConfig } from "next";

/*
  API-only Next.js app. All routes live under `src/app/api/**`. The frontend is
  a separate workspace and is NOT served from here.
*/
const nextConfig: NextConfig = {
  // Keep server bundles lean — these are only used server-side in route handlers.
  serverExternalPackages: ["postgres", "pino"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
