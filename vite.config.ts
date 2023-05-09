import react from "@vitejs/plugin-react";
import path from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: path.resolve(__dirname, "lib/index.ts"),
      insertTypesEntry: true,
      exclude: ["examples/vite-env.d.ts"],
      // need to add /* here, for some some reason if just giving dist/ it will generate some types outside dist folder
      outputDir: path.resolve(__dirname, "dist/*"),
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "airstack-web-sdk",
      formats: ["es", "umd"],
      fileName: (format) => `airstack-web-sdk.${format}.js`,
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
    minify: "esbuild",
  },
});