import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

const config = defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["setupTests.ts"],
    include: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    exclude: [...configDefaults.exclude, "**/__tests__/utils"],
    coverage: {
      provider: "v8",
      reporter: ["text", "clover", "json-summary", "html"],
      include: ["src/**"],
      exclude: [...(configDefaults.coverage.exclude ?? []), "src/types.ts"],
      thresholds: {
        "100": true,
      },
    },
  },
});

export default config;
