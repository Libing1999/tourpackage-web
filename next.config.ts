import type { NextConfig } from "next";
import path from "node:path";

/**
 * Security headers for the pages a browser actually renders.
 *
 * <p>The API sets its own, and they differ deliberately: this side ships HTML
 * and scripts, so it needs a policy that permits its own bundle, where the API
 * can forbid everything.
 */
const securityHeaders = [
  // Stops the browser second-guessing a declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt and braces alongside frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Password-reset and email-verification links carry tokens in the query
  // string; the default policy would send the whole URL to any host the page
  // links out to.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site needs a camera, a microphone or a location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Ignored by browsers over plain HTTP, so it is safe to send unconditionally.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),

  // The framework announces itself in a response header by default. Removing it
  // costs nothing and tells a scanner one less thing about the stack.
  poweredByHeader: false,

  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Uploaded media is served by the API host. Without this entry every
      // CMS image that points at an upload fails to optimise.
      { protocol: "http", hostname: "localhost", port: "8080" },
      ...(process.env.NEXT_PUBLIC_MEDIA_HOSTNAME
        ? [{ protocol: "https" as const, hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME }]
        : []),
    ],
    // Optimised variants cache for a month; a changed image means a changed URL,
    // because uploads are stored under a generated name.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
