import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { cp, mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import cypress from "cypress";
import { startFixtureServer } from "./fixture-server.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const output = path.join(root, "cypress/results");
const children = new Set();
let workspace;
let fixture;

function launch(args, env, logName) {
  const log = createWriteStream(path.join(output, logName));
  const child = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), ...args], {
    cwd: workspace, env, detached: true, stdio: ["ignore", "pipe", "pipe"],
  });
  children.add(child);
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  const done = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => {
      children.delete(child);
      log.end();
      if (code === 0) resolve();
      else reject(new Error(`next ${args[0]} failed (${code}); see cypress/results/${logName}`));
    });
  });
  // Background server failures are checked during readiness and cleanup.
  done.catch(() => {});
  return { child, done };
}

async function cleanup() {
  await Promise.all([...children].map((child) => new Promise((resolve) => {
    child.once("close", resolve);
    try { process.kill(-child.pid, "SIGKILL"); } catch { resolve(); }
  })));
  if (fixture) await fixture.close();
  if (workspace) await rm(workspace, { recursive: true, force: true });
}
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => { void cleanup().finally(() => process.exit(1)); });
}

try {
  await mkdir(output, { recursive: true });
  workspace = await mkdtemp(path.join(tmpdir(), "toeic-e2e-"));
  // Explicit allowlist: never copy .env*, .vercel, __words__, or the real .next cache.
  for (const file of ["src", "public", "next.config.ts", "tsconfig.json", "postcss.config.js", "tailwind.config.ts", "package.json", "package-lock.json"]) {
    await cp(path.join(root, file), path.join(workspace, file), { recursive: true });
  }
  await symlink(path.join(root, "node_modules"), path.join(workspace, "node_modules"), "dir");
  fixture = await startFixtureServer();
  // Keep only OS/runtime variables; production credentials cannot leak into the app.
  const env = Object.fromEntries(["PATH", "HOME", "TMPDIR", "LANG", "CI", "SYSTEMROOT", "NODE_EXTRA_CA_CERTS"]
    .filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]]));
  Object.assign(env, {
    NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
    BLOB_URL_IMPORTANT: `${fixture.url}/blob/important`,
    BLOB_URL_MEDIUM: `${fixture.url}/blob/medium`,
    BLOB_URL_HIGH: `${fixture.url}/blob/high`,
    UPSTASH_REDIS_REST_URL: fixture.url, UPSTASH_REDIS_REST_TOKEN: "e2e-only",
    NEXT_PUBLIC_SUPABASE_URL: fixture.url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "e2e-only",
  });
  console.log("Building an isolated production app with local Blob/Redis fixtures...");
  // Webpack supports the shared node_modules symlink outside this temporary project.
  await launch(["build", "--webpack"], env, "build.log").done;
  fixture.assertUsed();

  const probe = createServer();
  await new Promise((resolve, reject) => { probe.once("error", reject); probe.listen(0, "127.0.0.1", resolve); });
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const app = launch(["start", "--hostname", "127.0.0.1", "--port", String(port)], env, "server.log");
  const baseUrl = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (app.child.exitCode !== null) throw new Error("E2E app exited before becoming ready");
    try {
      ready = (await fetch(`${baseUrl}/today-words`, { signal: AbortSignal.timeout(1000) })).ok;
      if (ready) break;
    } catch { /* Retry until the bounded startup deadline. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("E2E app did not become ready; see cypress/results/server.log");
  console.log("Running Cypress against the isolated production app...");
  const result = await cypress.run({
    project: root,
    browser: process.env.E2E_BROWSER || "electron",
    config: {
      baseUrl,
      video: true,
      // Ads/analytics are unrelated to these flows and must not affect CI readiness.
      blockHosts: ["*.a8.net", "*.googlesyndication.com", "*.doubleclick.net", "*.google-analytics.com", "*.googletagmanager.com"],
      screenshotsFolder: path.join(output, "screenshots"),
      videosFolder: path.join(output, "videos"),
    },
  });
  fixture.assertUsed();
  if (result.status === "failed" || result.totalFailed || !result.totalTests || result.totalPending || result.totalSkipped) {
    throw new Error("Cypress E2E failed, skipped tests, or did not run any tests");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await cleanup();
}
