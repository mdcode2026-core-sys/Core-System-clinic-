#!"+"\/usr\/bin\/env node

import { spawn, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const planPath = process.env.TEST_EXECUTION_PLAN || "test-execution-plan.json";
const plan = JSON.parse(readFileSync(planPath, "utf8"));

const commands = {
  engineering: [
    ["typecheck", "npx", ["tsc", "--noEmit"]],
    ["lint", "npm", ["run", "lint"]],
    ["build", "npm", ["run", "build"]],
  ],
  i18n: [["i18n-audit", "npm", ["run", "i18n:audit"]], ["i18n-parity", "npm", ["run", "i18n:parity"]]],
  ux: [["widget-catalog", "npm", ["run", "ux:widget-catalog"]], ["domain-surface", "npm", ["run", "ux:domain-surface"]], ["patient-flow-stage6", "npm", ["run", "ux:patient-flow-stage6"]], ["patient-context-stage7", "npm", ["run", "ux:patient-context-stage7"]], ["global-search-stage8", "npm", ["run", "ux:global-search-stage8"]], ["mobile-stage11", "npm", ["run", "ux:mobile-stage11"]], ["security-stage12", "npm", ["run", "ux:security-stage12"]], ["legacy-stage14", "npm", ["run", "ux:legacy-stage14"]], ["docs-stage15", "npm", ["run", "ux:docs-stage15"]]],
  ajm: [["ajm-static", "npm", ["run", "ajm:audit"]], ["ajm-migrations", "npm", ["run", "ajm:migrations"]]],
  "workspace-authority": [["global-surfaces-workspace-authority", "npm", ["run", "test:global-surfaces-workspace-authority"]]],
  "cross-domain": [["cross-domain-runtime", "npm", ["run", "test:cross-domain-runtime"]]],
  "database-integrity": [["database-integrity", "npm", ["run", "test:cross-domain-runtime"]]],
  authorization: [["authorization-runtime", "npm", ["run", "test:cross-domain-runtime"]]],
  "authenticated-e2e": [["authenticated-route-e2e", "npx", ["playwright", "test", "tools/ajm-production-auth-e2e.spec.mjs", "--reporter=line"]]],
  "patient-journey": [["real-world-clinic-journey-e2e", "node", ["tools/clinic-admin-real-world-e2e-v2.mjs"]]],
  "procurement-inventory-finance": [["procurement-inventory-finance-runtime", "npm", ["run", "test:cross-domain-runtime"]]],
};

const runtimeSuites = new Set(["authenticated-e2e", "patient-journey", "cross-domain", "database-integrity", "authorization", "procurement-inventory-finance"]);
const required = [...new Set([...(plan.required_suites || []), "engineering"])].filter((suite) => commands[suite]);
const ordered = ["engineering", ...required.filter((suite) => suite !== "engineering" && !runtimeSuites.has(suite)), ...required.filter((suite) => runtimeSuites.has(suite))];
const results = [];
let server = null;
let runtimeStartFailure = null;
let buildPassed = false;

function run(command, args, extra = {}) { return spawnSync(command, args, { stdio: "inherit", env: process.env, shell: false, ...extra }); }
function startServer() {
  if (server) return true;
  if (!buildPassed) { runtimeStartFailure = "Runtime suites require a successful production build"; return false; }
  console.log("\n=== RUNTIME SERVER START ===");
  server = spawn("npm", ["start"], { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000", PORT: "3000" } });
  for (let i = 0; i < 60; i += 1) {
    const probe = spawnSync("curl", ["-fsS", "--max-time", "3", "http://127.0.0.1:3000/api/build-info"], { stdio: "ignore" });
    if (probe.status === 0) { console.log("=== RUNTIME SERVER READY ==="); return true; }
    if (server.exitCode !== null) { runtimeStartFailure = `Local production server exited with code ${server.exitCode}`; return false; }
    spawnSync("sleep", ["2"], { stdio: "ignore" });
  }
  runtimeStartFailure = "Local production server did not become ready within 120 seconds"; return false;
}
function stopServer() { if (!server) return; console.log("\n=== RUNTIME SERVER STOP ==="); server.kill("SIGTERM"); server = null; }
function addBlockedResult(suite, test, command, reason) { results.push({ suite, test, command: [command, ...(commands[suite].find(([name]) => name === test)?.slice(2) || [])].join(" "), status: "FAIL", exitCode: 1, durationMs: 0, reason }); console.error(`=== SUITE=${suite} TEST=${test} FAIL blocked=${reason} ===`); }

try {
  for (const suite of ordered) {
    const needsRuntime = runtimeSuites.has(suite);
    if (needsRuntime && !startServer()) { for (const [test, command] of commands[suite]) addBlockedResult(suite, test, command, runtimeStartFailure || "Runtime server unavailable"); continue; }
    for (const [test, command, args] of commands[suite]) {
      const started = Date.now(); console.log(`\n=== SUITE=${suite} TEST=${test} START ===`); let exitCode = 1;
      try { const result = run(command, args); exitCode = result.status ?? 1; } catch (error) { console.error(error instanceof Error ? error.stack : String(error)); }
      const record = { suite, test, command: [command, ...args].join(" "), status: exitCode === 0 ? "PASS" : "FAIL", exitCode, durationMs: Date.now() - started };
      results.push(record); if (suite === "engineering" && test === "build") buildPassed = exitCode === 0; console.log(`=== SUITE=${suite} TEST=${test} ${record.status} exit=${exitCode} ===`);
    }
  }
} finally { stopServer(); }

const failures = results.filter((r) => r.status === "FAIL");
const report = { contract_version: plan.contract_version, baseline: plan.baseline, candidate: plan.candidate, regression_level: plan.regression_level, required_suites: required, execution_order: ordered, results, summary: { total: results.length, passed: results.filter((r) => r.status === "PASS").length, failed: failures.length }, status: failures.length ? "FAIL" : "PASS" };
writeFileSync("test-execution-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nTEST_EXECUTION_STATUS=${report.status}`); console.log(`TEST_EXECUTION_FAILED=${failures.length}`); for (const failure of failures) console.error(`FAILURE_LOCATION suite=${failure.suite} test=${failure.test} exit=${failure.exitCode}`);
process.exitCode = failures.length ? 1 : 0;
