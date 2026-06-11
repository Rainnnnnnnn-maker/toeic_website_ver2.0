import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/lib/(tests)/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/(tests)/**",
        "src/lib/json-ld.ts",
        "src/lib/og-utils.ts",
        "src/lib/upstash.ts",
        "src/lib/wordCache.ts",
      ],
    },
  },
});

