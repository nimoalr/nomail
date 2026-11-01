#!/usr/bin/env node
// Smoke test for the OpenNext/Cloudflare build.
//
// Serves the already-built worker (.open-next/) with `wrangler dev`, which runs
// it in workerd — the same runtime as production — then requests every route
// and fails if any of them errors or the runtime logs an error.
//
// Usage: npm run build:worker && npm run smoke

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const PORT = Number(process.env.SMOKE_PORT ?? 8787);
const BASE = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 60_000;

// [path, expected status, substring expected in the body (optional)]
const ROUTES = [
  ["/", 200, "</html>"],
  ["/app", 200, "</html>"],
  ["/faq", 200, "</html>"],
  ["/login", 200, "</html>"],
  ["/login/cloudflare", 200, "</html>"],
  ["/settings", 200, "</html>"],
  ["/icon.svg", 200, "<svg"],
  ["/apple-icon", 200],
  ["/this-route-does-not-exist", 404],
];

if (!existsSync(".open-next/worker.js")) {
  console.error("✗ .open-next/worker.js not found — run `npm run build:worker` first.");
  process.exit(1);
}

let logs = "";
const wrangler = spawn(
  "npx",
  ["wrangler", "dev", "--port", String(PORT), "--ip", "127.0.0.1", "--show-interactive-dev-session=false"],
  { stdio: ["ignore", "pipe", "pipe"], detached: true, env: { ...process.env, CI: "true" } },
);
wrangler.stdout.on("data", (d) => (logs += d));
wrangler.stderr.on("data", (d) => (logs += d));

const stop = () => {
  try {
    process.kill(-wrangler.pid, "SIGTERM");
  } catch {}
};
process.on("exit", stop);
process.on("SIGINT", () => process.exit(130));

async function waitForServer() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (wrangler.exitCode !== null) throw new Error("wrangler dev exited early");
    try {
      await fetch(BASE, { redirect: "manual" });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`server did not start within ${STARTUP_TIMEOUT_MS / 1000}s`);
}

let failures = 0;
try {
  await waitForServer();

  for (const [path, expectedStatus, expectedBody] of ROUTES) {
    const res = await fetch(BASE + path, { redirect: "manual" });
    const body = await res.text();
    const problems = [];
    if (res.status !== expectedStatus) problems.push(`status ${res.status}, expected ${expectedStatus}`);
    if (expectedBody && !body.includes(expectedBody)) problems.push(`body missing ${JSON.stringify(expectedBody)}`);

    if (problems.length) {
      failures++;
      console.error(`✗ ${path} — ${problems.join("; ")}`);
    } else {
      console.log(`✓ ${path} — ${res.status}`);
    }
  }

  // Give wrangler a moment to flush logs for the last requests.
  await new Promise((r) => setTimeout(r, 500));
  const errorLines = logs.split("\n").filter((l) => /\[wrangler:error\]|^\s*✘|Uncaught|Unexpected loadManifest/.test(l));
  if (errorLines.length) {
    failures++;
    console.error("✗ runtime logged errors:\n" + errorLines.map((l) => "    " + l).join("\n"));
  }
} catch (err) {
  failures++;
  console.error(`✗ ${err.message}`);
}

if (failures) {
  console.error("\n--- wrangler dev output ---\n" + logs);
  console.error(`\nSmoke test failed (${failures} problem${failures > 1 ? "s" : ""}).`);
  process.exit(1);
}
console.log("\nSmoke test passed.");
process.exit(0);
