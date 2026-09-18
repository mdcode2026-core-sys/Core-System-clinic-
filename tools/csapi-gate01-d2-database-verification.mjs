#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const CLI = ["--yes", "supabase@latest"];
const timeoutMs = Number(process.env.TEST_COMMAND_TIMEOUT_MS || 900000);
let started = false;
let exitCode = 0;

function run(args, options = {}) {
  console.log("$ npx " + ["--yes", "supabase@latest", ...args].join(" "));
  const result = spawnSync("npx", [...CLI, ...args], {
    stdio: "inherit",
    env: {
      ...process.env,
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
    shell: false,
    timeout: options.timeout ?? timeoutMs,
    killSignal: "SIGTERM",
  });
  if (result.error) {
    console.error(`COMMAND_ERROR=${result.error.code || "unknown"} ${result.error.message}`);
  }
  return result.status ?? 1;
}

function cleanup() {
  if (!started) return;
  console.log("Cleaning up local Supabase stack...");
  spawnSync("npx", [...CLI, "stop", "--no-backup"], {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    shell: false,
    timeout: 180000,
    killSignal: "SIGTERM",
  });
  started = false;
}

process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

console.log("D2_DATABASE_VERIFICATION=START");
console.log("TARGET=LOCAL_SUPABASE_ONLY");
console.log("HOSTED_SUPABASE_MUTATION=NONE");
console.log("VERCEL=NOT_USED");

if (!existsSync("supabase/config.toml")) {
  console.log("LOCAL_CONFIG=missing; initializing temporary local Supabase configuration");
  if (run(["init"], { timeout: 120000 }) !== 0) {
    console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-init-failed");
    process.exit(1);
  }
}

if (run(["--help"], { timeout: 120000 }) !== 0) {
  console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-cli-unavailable");
  process.exit(1);
}

const localDbOnlyServices = ["gotrue", "realtime", "storage-api", "imgproxy", "kong", "mailpit", "postgrest", "postgres-meta", "studio", "edge-runtime", "logflare", "vector", "supavisor"];
if (run(["start", "--debug", "--exclude", localDbOnlyServices.join(",")], { timeout: 900000 }) !== 0) {
  console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-start-failed");
  process.exit(1);
}
started = true;

if (run(["db", "reset", "--local", "--no-seed"], { timeout: 900000 }) !== 0) {
  console.error("D2_DATABASE_VERIFICATION=FAIL reason=local-migration-reset-failed");
  exitCode = 1;
} else if (run(["test", "db", "supabase/tests/csapi_gate01_d2_database_foundations.sql", "--local"], { timeout: 900000 }) !== 0) {
  console.error("D2_DATABASE_VERIFICATION=FAIL reason=pgTAP-failed");
  exitCode = 1;
} else {
  console.log("D2_DATABASE_VERIFICATION=PASS");
}

cleanup();
process.exit(exitCode);
