import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    // we need buffer polyfill for @xmtp/xmtp-js
    nodePolyfills({ include: ["buffer"] })
  ],
  build: {
    outDir: "dist-static",
  },
});
