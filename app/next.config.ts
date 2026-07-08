import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin the Turbopack workspace root to THIS app. Without it, Next infers the root
// from a stray parent lockfile (../../package-lock.json) and its file watcher
// misses edits under fe/, so CSS/HMR changes don't reload. Pinning fixes that.
const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: here,
  },
};

export default nextConfig;
