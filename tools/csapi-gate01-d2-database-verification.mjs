#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

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

// Supabase local stack identity defaults to the working directory. Use a stable lowercase\n// project_id in CI so Docker service hostnames remain DNS-safe across runners.\nconst configPath = "supabase/config.toml";\nlet localConfig = readFileSync(configPath, "utf8");\nlocalConfig = localConfig.replace(/^project_id\\s*=.*$/m, \'project_id = "core-system-d2"\');\nwriteFileSync(configPath, localConfig);\nconsole.log("LOCAL_PROJECT_ID=core-system-d2");\n\nif (run(["--help"], { timeout: 120000 }) !== 0) {
  console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-cli-unavailable");
  process.exit(1);
}

// D2 uses the complete local Supabase stack because the migration chain may include\n// Supabase-managed service migrations. The critical CI requirement is isolation\n// from hosted environments, not omission of service dependencies.\nif (run(["start", "--debug"], { timeout: 900000 }) !== 0) {\n  console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-start-failed");\n  process.exit(1);\n}\nstarted = true;\n\nif (run(["db", "reset", "--local", "--no-seed"], { timeout: 900000 }) !== 0) {
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
