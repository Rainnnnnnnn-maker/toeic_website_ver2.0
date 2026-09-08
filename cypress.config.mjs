import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
  },
  // Allow cold Next.js compilation and the existing server-side detail fetch.
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 120000,
  viewportWidth: 1280,
  viewportHeight: 900,
  video: false,
});
