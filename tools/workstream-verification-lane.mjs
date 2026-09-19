#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
  "csapi-gate01-d3-database": [["d3-database-lifecycle-authority", "node", ["tools/csapi-gate01-d3-database-verification.mjs"]]],
  "csapi-gate01-d3-runtime": [["d3-integrated-runtime", "node", ["tools/csapi-gate01-d3-runtime-v2.mjs"]]],
  "patient-flow-stage6-regression": [["patient-flow-stage6-regression", "npm", ["run", "ux:patient-flow-stage6"]]],
};

const runtimeLanes = new Set([
  "authenticated-e2e",
  "patient-journey",
  "cross-domain-runtime",
  "procurement-inventory-finance",
  "global-experience-presentation-runtime",
  "csapi-gate01-d3-runtime",
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

function runCapture(command, args) {
  const result = spawnSync(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    shell: false,
    encoding: "utf8",
    timeout: timeoutMs,
  });
  return { status: result.status ?? 1, stdout: result.stdout || "", stderr: result.stderr || "" };
}

const d3RuntimeState = {
  started: false,
  configPath: "supabase/config.toml",
  originalConfig: null,
  renames: [],
};

function normalizeRuntimeMigrationVersions() {
  const dir = "supabase/migrations";
  const names = readdirSync(dir).filter((name) => name.endsWith(".sql"));
  const used = new Set(names.map((name) => name.match(/^(\d+)_/)?.[1]).filter(Boolean));
  const groups = new Map();
  for (const name of names.sort()) {
    const version = name.match(/^(\d+)_/)?.[1];
    if (!version) continue;
    if (!groups.has(version)) groups.set(version, []);
    groups.get(version).push(name);
  }
  for (const [version, duplicates] of groups) {
    for (let i = 1; i < duplicates.length; i += 1) {
      let suffix = 1;
      let replacement = version;
      while (used.has(replacement)) {
        replacement = String(BigInt(version) + BigInt(suffix)).padStart(version.length, "0");
        suffix += 1;
      }
      used.add(replacement);
      const from = join(dir, duplicates[i]);
      const to = join(dir, replacement + "_" + duplicates[i].slice(version.length + 1));

      renameSync(from, to);
      d3RuntimeState.renames.push({ from, to });
    }
  }
}

function restoreD3RuntimeWorkspace() {
  for (const { from, to } of [...d3RuntimeState.renames].reverse()) {
    try { if (existsSync(to)) renameSync(to, from); } catch {}
  }
  d3RuntimeState.renames = [];
  if (d3RuntimeState.originalConfig !== null) {
    try { writeFileSync(d3RuntimeState.configPath, d3RuntimeState.originalConfig); } catch {}
    d3RuntimeState.originalConfig = null;
  }
}

function prepareD3RuntimeEnvironment() {
  if (!existsSync(d3RuntimeState.configPath)) {
    const initialized = runCapture("npx", ["--yes", "supabase@latest", "init"]);
    if (initialized.status !== 0) {
      throw new Error(`Local Supabase init failed: ${initialized.stderr.slice(-1200)}`);
    }
  }

  d3RuntimeState.originalConfig = readFileSync(d3RuntimeState.configPath, "utf8");
  writeFileSync(d3RuntimeState.configPath, d3RuntimeState.originalConfig.replace(/^project_id\s*=.*$/m, 'project_id = "core-system-d3-runtime"'));
  normalizeRuntimeMigrationVersions();

  const started = runCapture("npx", ["--yes", "supabase@latest", "start", "--debug"]);
  if (started.status !== 0) {
    throw new Error(`Local Supabase runtime start failed: ${started.stderr.slice(-1600)}`);
  }
  d3RuntimeState.started = true;

  const status = runCapture("npx", ["--yes", "supabase@latest", "status", "-o", "json"]);
  if (status.status !== 0) {
    throw new Error(`Local Supabase runtime status failed: ${status.stderr.slice(-1200)}`);
  }
  const info = JSON.parse(status.stdout);
  if (!info.API_URL || !info.ANON_KEY || !info.SERVICE_ROLE_KEY) {
    throw new Error(`Local Supabase runtime status missing credentials: ${status.stdout.slice(-800)}`);
  }

  process.env.NEXT_PUBLIC_SUPABASE_URL = info.API_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = info.ANON_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = info.SERVICE_ROLE_KEY;

  if (run("npx", ["--yes", "supabase@latest", "db", "reset", "--local", "--no-seed"]) !== 0) {
    throw new Error("Local Supabase runtime migration reset failed");
  }
}

function cleanupD3RuntimeEnvironment() {
  restoreD3RuntimeWorkspace();
  if (d3RuntimeState.started) {
    spawnSync("npx", ["--yes", "supabase@latest", "stop", "--no-backup"], {
      stdio: "inherit",
      env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
      shell: false,
      timeout: 180000,
      killSignal: "SIGTERM",
    });
    d3RuntimeState.started = false;
  }
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
    lane === "global-experience-presentation-runtime" ||
    lane === "csapi-gate01-d3-runtime";

  if (needsPlaywright) {
    if (run("npm", ["install", "--no-save", "--no-package-lock", "@playwright/test@1.55.0", "playwright@1.55.0"]) !== 0) {
      throw new Error("Playwright package installation failed");
    }
    if (run("npx", ["playwright", "install", "chromium"]) !== 0) {
      throw new Error("Playwright browser installation failed");
    }
  }

  if (lane === "csapi-gate01-d3-runtime") {
    prepareD3RuntimeEnvironment();
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
  if (lane === "csapi-gate01-d3-runtime") {
    cleanupD3RuntimeEnvironment();
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
