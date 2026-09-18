#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const lane = process.env.VERIFICATION_LANE;
if (!lane) throw new Error("VERIFICATION_LANE is required");

const baseUrl = process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000";
const timeoutMs = Number(process.env.TEST_COMMAND_TIMEOUT_MS || 300000);

const commands = {
  engineering: [
    ["typecheck", "npx", ["tsc", "--noEmit"]],
    ["lint", "npm", ["run", "lint"]],
    ["build", "npm", ["run", "build"]],
  ],
  i18n: [
    ["i18n-audit", "npm", ["run", "i18n:audit"]],
    ["i18n-parity", "npm", ["run", "i18n:parity"]],
  ],
  "authenticated-e2e": [[
    "authenticated-route-e2e",
    "npx",
    ["playwright", "test", "tools/ajm-production-auth-e2e.spec.mjs", "--reporter=line"],
  ]],
  "patient-journey": [["real-world-clinic-journey-e2e", "node", ["tools/clinic-admin-real-world-e2e-v2.mjs"]]],
  "cross-domain-runtime": [["cross-domain-runtime", "npm", ["run", "test:cross-domain-runtime"]]],
  "procurement-inventory-finance": [["procurement-inventory-finance-runtime", "npm", ["run", "test:cross-domain-runtime"]]],
  "global-experience-presentation-static": [["global-experience-presentation", "npm", ["run", "test:global-experience-presentation"]]],
  "global-experience-presentation-runtime": [["global-experience-presentation-runtime", "node", ["tools/global-experience-presentation-runtime.spec.mjs"]]],
  "global-surfaces-workspace-authority": [["global-surfaces-workspace-authority", "npm", ["run", "test:global-surfaces-workspace-authority"]]],
  "header-chat-static": [["header-chat", "npm", ["run", "test:header-chat"]]],
  "header-technical-foundation-static": [["header-technical-foundation", "npm", ["run", "test:header-technical-foundation"]]],
  "communications-wave-b-static": [["communications-wave-b", "npm", ["run", "test:communications-wave-b"]]],
  "csapi-gate01-d2-database": [["d2-database-foundations", "node", ["tools/csapi-gate01-d2-database-verification.mjs"]]],
};

const runtimeLanes = new Set([
  "authenticated-e2e",
  "patient-journey",
  "cross-domain-runtime",
  "procurement-inventory-finance",
  "global-experience-presentation-runtime",
]);

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
    timeout: timeoutMs,
    killSignal: "SIGTERM",
  });
  if (result.error) {
    console.error(`COMMAND_ERROR=${result.error.code || "unknown"} ${result.error.message}`);
  }
  return result.status ?? (result.error?.code === "ETIMEDOUT" ? 124 : 1);
}

function ensureRuntimeServer() {
  const child = spawn("npm", ["start"], {
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_APP_URL: baseUrl, PORT: "3000" },
  });
  for (let i = 0; i < 60; i += 1) {
    const probe = spawnSync("curl", ["-fsS", "--max-time", "3", `${baseUrl}/api/build-info`], { stdio: "ignore" });
    if (probe.status === 0) return child;
    if (child.exitCode !== null) {
      throw new Error(`Local production server exited with code ${child.exitCode}`);
    }
    spawnSync("sleep", ["2"]);
  }
  child.kill("SIGTERM");
  throw new Error("Local production server did not become ready within 120 seconds");
}

if (!commands[lane]) throw new Error(`VERIFICATION_LANE_UNSUPPORTED=${lane}`);

const startedAt = new Date().toISOString();
console.log(`VERIFICATION_LANE_START=${lane}`);

let server = null;
const results = [];
let exitCode = 0;

try {
  if (lane !== "csapi-gate01-d2-database" && run("npm", ["ci"]) !== 0) {
    throw new Error("npm ci failed");
  }

  const needsPlaywright = lane === "authenticated-e2e" ||
    lane === "patient-journey" ||
    lane === "global-experience-presentation-runtime";

  if (needsPlaywright) {
    if (run("npm", ["install", "--no-save", "--no-package-lock", "@playwright/test@1.55.0", "playwright@1.55.0"]) !== 0) {
      throw new Error("Playwright package installation failed");
    }
    if (run("npx", ["playwright", "install", "chromium"]) !== 0) {
      throw new Error("Playwright browser installation failed");
    }
  }

  if (runtimeLanes.has(lane)) {
    if (run("npm", ["run", "build"]) !== 0) {
      throw new Error("Runtime lane build failed");
    }
    server = ensureRuntimeServer();
  }

  for (const [name, command, args] of commands[lane]) {
    console.log(`=== LANE=${lane} TEST=${name} START ===`);
    const code = run(command, args);
    results.push({ name, command: [command, ...args].join(" "), exitCode: code, status: code === 0 ? "PASS" : "FAIL" });
    console.log(`=== LANE=${lane} TEST=${name} ${code === 0 ? "PASS" : "FAIL"} exit=${code} ===`);
    if (code !== 0) {
      exitCode = code;
      break;
    }
  }
} catch (error) {
  exitCode = exitCode || 1;
  results.push({
    name: "lane-setup",
    command: "lane setup",
    exitCode,
    status: "FAIL",
    error: error instanceof Error ? error.message : String(error),
  });
} finally {
  if (server) {
    server.kill("SIGTERM");
    server = null;
  }
}

const report = {
  lane,
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  status: exitCode === 0 ? "PASS" : "FAIL",
  results,
};

writeFileSync(`verification-lane-${lane}.json`, JSON.stringify(report, null, 2) + "\n");
if (exitCode === 0) console.log(`VERIFICATION_LANE_RESULT=${lane}:PASS`);
else console.error(`VERIFICATION_LANE_RESULT=${lane}:FAIL`);
process.exitCode = exitCode;
