import react from "@vitejs/plugin-react";
import { defineConfig, configDefaults } from "vitest/config";
import dts from "vite-plugin-dts";
import renameNodeModules from "rollup-plugin-rename-node-modules";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    target: "modules",
    lib: {
      entry: [
        "src/lib/index.ts",
        "src/lib/hooks/index.ts",
        "src/lib/apis/index.ts",
        "src/lib/components/index.ts",
      ],
      name: "airstack-web-sdk",
      formats: ["es"],
      fileName: "[name]",
    },
    minify: false,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        // we need to set preserveModules to true, so vite will not bundle the library
        // and will preserve the folder stucture of the library, so the library can be tree-shaken
        preserveModules: true,
        // build files from src/lib to the dist folder
        preserveModulesRoot: "src/lib",
        entryFileNames: ({ name: fileName }) => {
          return `${fileName}.js`;
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // when we use preserveModules, vite will create a node_modules folder in the dist folder
        // the node_modules folder will contain all the dependencies of the library
        // we need to rename the node_modules folder to something else, because npm publish will ignore the node_modules folder
        plugins: [renameNodeModules("external")],
      },
    },
  },
  test: {
    exclude: [...configDefaults.exclude],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./setupTests.js"],
  },
});
