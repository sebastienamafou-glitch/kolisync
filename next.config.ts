import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next"; // 🚨 CORRECTION TS : Import du type officiel

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // swcMinify: true, -> 🚨 CORRECTION : Supprimé (invalide pour ce plugin et géré par Next.js par défaut)
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    importScripts: ["/custom-sw.js"],
  },
});

// 🚨 CORRECTION TS : Typage explicite de l'objet pour verrouiller 'output: "standalone"'
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(withPWA(nextConfig), {
  org: "webappci",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
