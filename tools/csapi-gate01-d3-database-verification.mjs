#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CLI = ["--yes", "supabase@latest"];
const timeoutMs = Number(process.env.TEST_COMMAND_TIMEOUT_MS || 900000);
let started = false;
const temporaryRenames = [];
const temporaryRewrites = [];

function run(args, options = {}) {
  console.log("$ npx " + [ "--yes", "supabase@latest", ...args ].join(" "));
  const result = spawnSync("npx", [...CLI, ...args], {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    shell: false,
    timeout: options.timeout ?? timeoutMs,
    killSignal: "SIGTERM",
  });
  if (result.error) console.error("COMMAND_ERROR=" + (result.error.code || "unknown") + " " + result.error.message);
  return result.status ?? 1;
}

function restoreWorkspace() {
  for (const { path, original } of [...temporaryRewrites].reverse()) {
    try { writeFileSync(path, original); } catch (error) { console.error("RESTORE_REWRITE_FAILED=" + path + " " + String(error)); }
  }
  for (const { from, to } of [...temporaryRenames].reverse()) {
    try { if (existsSync(to)) renameSync(to, from); } catch (error) { console.error("RESTORE_RENAME_FAILED=" + to + " " + String(error)); }
  }
  temporaryRewrites.length = 0;
  temporaryRenames.length = 0;
}

function normalizeDuplicateMigrationVersions() {
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
      temporaryRenames.push({ from, to });
      console.log("LOCAL_MIGRATION_VERSION_NORMALIZED " + duplicates[i] + " -> " + to);
    }
  }
}

function cleanup() {
  restoreWorkspace();
  if (!started) return;
  spawnSync("npx", [...CLI, "stop", "--no-backup"], {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    shell: false,
    timeout: 180000,
    killSignal: "SIGTERM",
  });
  started = false;
}

process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("SIGTERM", () => { cleanup(); process.exit(143); });

console.log("D3_DATABASE_VERIFICATION=START");
console.log("TARGET=LOCAL_SUPABASE_ONLY");
console.log("HOSTED_SUPABASE_MUTATION=NONE");
console.log("VERCEL=NOT_USED");

if (!existsSync("supabase/config.toml")) {
  if (run(["init"], { timeout: 120000 }) !== 0) {
    console.error("D3_DATABASE_VERIFICATION=FAIL reason=supabase-init-failed");
    process.exit(1);
  }
}

const configPath = "supabase/config.toml";
const originalConfig = readFileSync(configPath, "utf8");
temporaryRewrites.push({ path: configPath, original: originalConfig });
writeFileSync(configPath, originalConfig.replace(/^project_id\s*=.*$/m, 'project_id = "core-system-d3"'));

if (run(["--help"], { timeout: 120000 }) !== 0) {
  console.error("D3_DATABASE_VERIFICATION=FAIL reason=supabase-cli-unavailable");
  process.exit(1);
}

normalizeDuplicateMigrationVersions();

try {
  if (run(["start", "--debug"], { timeout: 900000 }) !== 0) {
    console.error("D3_DATABASE_VERIFICATION=FAIL reason=supabase-start-failed");
    process.exit(1);
  }
  started = true;

  if (run(["db", "reset", "--local", "--no-seed"], { timeout: 900000 }) !== 0) {
    console.error("D3_DATABASE_VERIFICATION=FAIL reason=local-migration-reset-failed");
    process.exit(1);
  }

  if (run(["test", "db", "supabase/tests/csapi_gate01_d3_lifecycle_authority.sql", "--local"], { timeout: 900000 }) !== 0) {
    console.error("D3_DATABASE_VERIFICATION=FAIL reason=pgTAP-failed");
    process.exit(1);
  }

  console.log("D3_DATABASE_VERIFICATION=PASS");
} finally {
  cleanup();
}
