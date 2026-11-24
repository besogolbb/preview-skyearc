import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for the EasyPanel Docker image.
  output: "standalone",
  // The loader reads data/previews/*.json at runtime; make sure tracing ships it.
  outputFileTracingIncludes: {
    "/[slug]": ["./data/previews/**/*"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
