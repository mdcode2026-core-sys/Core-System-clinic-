#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const planPath = process.env.TEST_EXECUTION_PLAN || "test-execution-plan.json";
const plan = JSON.parse(readFileSync(planPath, "utf8"));

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
  ux: [
    ["widget-catalog", "npm", ["run", "ux:widget-catalog"]],
    ["domain-surface", "npm", ["run", "ux:domain-surface"]],
    ["patient-flow-stage6", "npm", ["run", "ux:patient-flow-stage6"]],
    ["patient-context-stage7", "npm", ["run", "ux:patient-context-stage7"]],
    ["global-search-stage8", "npm", ["run", "ux:global-search-stage8"]],
    ["mobile-stage11", "npm", ["run", "ux:mobile-stage11"]],
    ["security-stage12", "npm", ["run", "ux:security-stage12"]],
    ["legacy-stage14", "npm", ["run", "ux:legacy-stage14"]],
    ["docs-stage15", "npm", ["run", "ux:docs-stage15"]],
  ],
  ajm: [
    ["ajm-static", "npm", ["run", "ajm:audit"]],
    ["ajm-migrations", "npm", ["run", "ajm:migrations"]],
  ],
  "cross-domain": [
    ["cross-domain-runtime", "npm", ["run", "test:cross-domain-runtime"]],
  ],
  "database-integrity": [
    ["database-integrity", "npm", ["run", "test:cross-domain-runtime"]],
  ],
  authorization: [
    ["authorization-runtime", "npm", ["run", "test:cross-domain-runtime"]],
  ],
  "authenticated-e2e": [
    ["authenticated-route-e2e", "npx", ["playwright", "test", "tools/ajm-production-auth-e2e.spec.mjs", "--reporter=line"]],
  ],
  "patient-journey": [
    ["real-world-clinic-journey-e2e", "node", ["tools/clinic-admin-real-world-e2e-v2.mjs"]],
  ],
  "procurement-inventory-finance": [
    ["procurement-inventory-finance-runtime", "npm", ["run", "test:cross-domain-runtime"]],
  ],
};

const required = [...new Set([...(plan.required_suites || []), "engineering"])]
  .filter((suite) => commands[suite]);
const results = [];

for (const suite of required) {
  for (const [test, command, args] of commands[suite]) {
    const started = Date.now();
    console.log(`\n=== SUITE=${suite} TEST=${test} START ===`);
    const result = spawnSync(command, args, {
      stdio: "inherit",
      env: process.env,
      shell: false,
    });
    const exitCode = result.status ?? 1;
    const record = {
      suite,
      test,
      command: [command, ...args].join(" "),
      status: exitCode === 0 ? "PASS" : "FAIL",
      exitCode,
      durationMs: Date.now() - started,
    };
    results.push(record);
    console.log(`=== SUITE=${suite} TEST=${test} ${record.status} exit=${exitCode} ===`);
  }
}

const failures = results.filter((r) => r.status === "FAIL");
const report = {
  contract_version: plan.contract_version,
  baseline: plan.baseline,
  candidate: plan.candidate,
  regression_level: plan.regression_level,
  required_suites: required,
  results,
  summary: {
    total: results.length,
    passed: results.filter((r) => r.status === "PASS").length,
    failed: failures.length,
  },
  status: failures.length ? "FAIL" : "PASS",
};

writeFileSync("test-execution-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nTEST_EXECUTION_STATUS=${report.status}`);
console.log(`TEST_EXECUTION_FAILED=${failures.length}`);
for (const failure of failures) {
  console.error(`FAILURE_LOCATION suite=${failure.suite} test=${failure.test} exit=${failure.exitCode}`);
}
process.exitCode = failures.length ? 1 : 0;
