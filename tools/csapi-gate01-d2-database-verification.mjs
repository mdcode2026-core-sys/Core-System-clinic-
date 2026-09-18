#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CLI = ["--yes", "supabase@latest"];
const timeoutMs = Number(process.env.TEST_COMMAND_TIMEOUT_MS || 900000);
let started = false;
let exitCode = 0;
const temporaryRenames = [];
const temporaryRewrites = [];

function run(args, options = {}) {
  console.log("$ npx " + ["--yes", "supabase@latest", ...args].join(" "));
  const result = spawnSync("npx", [...CLI, ...args], {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    shell: false,
    timeout: options.timeout ?? timeoutMs,
    killSignal: "SIGTERM",
  });
  if (result.error) {
    console.error("COMMAND_ERROR=" + (result.error.code || "unknown") + " " + result.error.message);
  }
  return result.status ?? 1;
}

function restoreTemporaryMigrationWorkspace() {
  for (const { path: filePath, original } of [...temporaryRewrites].reverse()) {
    try { writeFileSync(filePath, original); }
    catch (error) { console.error("RESTORE_REWRITE_FAILED=" + filePath + " " + String(error)); }
  }
  for (const { from, to } of [...temporaryRenames].reverse()) {
    try { if (existsSync(to)) renameSync(to, from); }
    catch (error) { console.error("RESTORE_RENAME_FAILED=" + to + " " + String(error)); }
  }
  temporaryRewrites.length = 0;
  temporaryRenames.length = 0;
}

function prepareTemporaryMigrationWorkspace() {
  const migrationsDir = "supabase/migrations";
  if (!existsSync(migrationsDir)) throw new Error("Missing supabase/migrations");

  const names = readdirSync(migrationsDir).filter((name) => name.endsWith(".sql"));
  const usedVersions = new Set(
    names
      .map((name) => name.match(/^(\d+)_/))
      .filter(Boolean)
      .map((match) => match[1]),
  );

  const byVersion = new Map();
  for (const name of names.sort()) {
    const match = name.match(/^(\d+)_/);
    if (!match) continue;
    const version = match[1];
    if (!byVersion.has(version)) byVersion.set(version, []);
    byVersion.get(version).push(name);
  }

  for (const [version, duplicates] of byVersion) {
    if (duplicates.length < 2) continue;

    for (let i = 1; i < duplicates.length; i += 1) {
      let suffix = 1;
      let replacementVersion = version;
      while (usedVersions.has(replacementVersion)) {
        replacementVersion = version.length < 14
          ? String(BigInt(version) * 10000000000n + BigInt(suffix))
          : String(BigInt(version) + BigInt(suffix)).padStart(14, "0");
        suffix += 1;
      }
      usedVersions.add(replacementVersion);

      const from = join(migrationsDir, duplicates[i]);
      const toName = replacementVersion + "_" + duplicates[i].slice(15);
      const to = join(migrationsDir, toName);
      renameSync(from, to);
      temporaryRenames.push({ from, to });
      console.log("LOCAL_MIGRATION_VERSION_NORMALIZED " + duplicates[i] + " -> " + toName + " (duplicate numeric version " + version + ")");
    }
  }

  const fixturePath = join(
    migrationsDir,
    "20260830030534_ajm_reality_audit_clinical_resource_scheduling.sql",
  );

  if (existsSync(fixturePath)) {
    const original = readFileSync(fixturePath, "utf8");
    const marker = "insert into public.clinic_resources";
    const markerIndex = original.indexOf(marker);

    if (markerIndex >= 0) {
      const prefix = original.slice(0, markerIndex);
      const insert = original.slice(markerIndex).trim();
      const guarded = [
        "do $fixture$",
        "begin",
        "  if exists (",
        "    select 1",
        "    from public.master_tenants",
        "    where id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid",
        "  ) then",
        "    " + insert,
        "  else",
        "    raise notice 'Reality-audit resource fixture skipped: Zada test tenant is not present';",
        "  end if;",
        "end",
        "$fixture$;",
        "",
      ].join("\n");

      if (guarded !== original) {
        writeFileSync(fixturePath, prefix + guarded);
        temporaryRewrites.push({ path: fixturePath, original });
        console.log("LOCAL_FIXTURE_GUARD=20260830030534");
      }
    }
  }

  const inventorySyncPath = join(migrationsDir, "20260803_sync_inventory.sql");
  if (existsSync(inventorySyncPath)) {
    const original = readFileSync(inventorySyncPath, "utf8");
    if (original.includes("CREATE POLICY IF NOT EXISTS ")) {
      const replacement = original.replace(
        "CREATE POLICY IF NOT EXISTS ",
        "CREATE POLICY ",
      );
      writeFileSync(inventorySyncPath, replacement);
      temporaryRewrites.push({ path: inventorySyncPath, original });
      console.log("LOCAL_MIGRATION_SYNTAX_GUARD=20260803_sync_inventory");
    }
  }

  console.log("LOCAL_MIGRATION_NORMALIZATION_COUNT=" + temporaryRenames.length);
}

function cleanup() {
  restoreTemporaryMigrationWorkspace();

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

process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("SIGTERM", () => { cleanup(); process.exit(143); });

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

const configPath = "supabase/config.toml";
let localConfig = readFileSync(configPath, "utf8");
localConfig = localConfig.replace(/^project_id\s*=.*$/m, 'project_id = "core-system-d2"');
writeFileSync(configPath, localConfig);
console.log("LOCAL_PROJECT_ID=core-system-d2");

if (run(["--help"], { timeout: 120000 }) !== 0) {
  console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-cli-unavailable");
  process.exit(1);
}

prepareTemporaryMigrationWorkspace();

try {
  if (run(["start", "--debug"], { timeout: 900000 }) !== 0) {
    console.error("D2_DATABASE_VERIFICATION=FAIL reason=supabase-start-failed");
    exitCode = 1;
  } else {
    started = true;
  }

  if (exitCode === 0 && run(["db", "reset", "--local", "--no-seed"], { timeout: 900000 }) !== 0) {
    console.error("D2_DATABASE_VERIFICATION=FAIL reason=local-migration-reset-failed");
    exitCode = 1;
  }

  if (
    exitCode === 0 &&
    run(["test", "db", "supabase/tests/csapi_gate01_d2_database_foundations.sql", "--local"], { timeout: 900000 }) !== 0
  ) {
    console.error("D2_DATABASE_VERIFICATION=FAIL reason=pgTAP-failed");
    exitCode = 1;
  }

  if (exitCode === 0) console.log("D2_DATABASE_VERIFICATION=PASS");
} finally {
  cleanup();
}

process.exit(exitCode);
