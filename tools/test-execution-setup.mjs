#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.TEST_BASE_REF || "main";
const head = process.env.TEST_HEAD_REF || "HEAD";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const changed = git(["diff", "--name-only", `${base}...${head}`])
  .split("\n")
  .map((x) => x.trim())
  .filter(Boolean);

const plan = {
  contract_version: "2.0",
  baseline: base,
  candidate: head,
  changed_files: changed,
  impact: new Set(["TARGET"]),
  roles: new Set(),
  required_engineering: new Set(["typecheck", "lint", "build"]),
  required_suites: new Set(["engineering"]),
  required_e2e: new Set(),
  regression_level: "R0",
  workstream_contracts: [],
  workstream_checks: [],
};

const add = (impact, ...suites) => {
  plan.impact.add(impact);
  suites.forEach((suite) => plan.required_suites.add(suite));
};

const regressionRank = { R0: 0, R1: 1, R2: 2, R3: 3, R4: 4 };
const elevateRegression = (level) => {
  if (regressionRank[level] > regressionRank[plan.regression_level]) {
    plan.regression_level = level;
  }
};

function loadWorkstreamContracts() {
  const directory = "docs/testing/workstream-contracts";
  if (!existsSync(directory)) return;

  for (const name of readdirSync(directory).filter((file) => file.endsWith(".execution.json"))) {
    const path = join(directory, name);
    let contract;
    try {
      contract = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      throw new Error(`WORKSTREAM_CONTRACT_INVALID=${path}: ${error instanceof Error ? error.message : String(error)}`);
    }

    const patterns = contract?.applicability?.match_any;
    if (!Array.isArray(patterns) || !contract.workstream_id || !contract.contract_path) continue;

    const applies = changed.some((file) => patterns.some((pattern) => new RegExp(pattern).test(file)));
    if (!applies) continue;

    if (!existsSync(contract.contract_path)) {
      throw new Error(`WORKSTREAM_CONTRACT_MISSING=${contract.contract_path}`);
    }

    plan.workstream_contracts.push({
      workstream_id: contract.workstream_id,
      contract_path: contract.contract_path,
      contract_version: contract.contract_version || "1.0",
    });

    for (const engineering of contract.required_engineering || []) {
      plan.required_engineering.add(engineering);
    }
    for (const suite of contract.required_suites || []) {
      plan.required_suites.add(suite);
    }
    for (const check of contract.workstream_checks || []) {
      plan.workstream_checks.push({
        workstream_id: contract.workstream_id,
        ...check,
      });
    }

    if (contract.regression_level) elevateRegression(contract.regression_level);
  }
}

loadWorkstreamContracts();

for (const file of changed) {
  if (/^supabase\//.test(file) || /database|migration|rls|policy/i.test(file)) {
    add("DATA_IMPACT", "database-integrity", "authorization");
    plan.impact.add("SECURITY_IMPACT");
    plan.required_engineering.add("database-integrity");
    plan.required_engineering.add("authorization");
  }
  if (/permission|role|auth|workspace/i.test(file)) {
    add("ROLE_IMPACT", "authorization", "authenticated-e2e");
    plan.impact.add("SECURITY_IMPACT");
    ["Clinic Admin", "Receptionist", "Doctor", "Nurse/Assistant", "Finance/Accounting", "Follow-up Staff", "Super Admin boundary"]
      .forEach((r) => plan.roles.add(r));
    plan.required_e2e.add("role-authorization");
  }
  if (/patient|appointment|agenda|queue|visit|treatment|follow-up|portal|work-center|clinical/i.test(file)) {
    add("INTEGRATED", "patient-journey", "cross-domain");
    plan.impact.add("CROSS_IMPACT");
    plan.roles.add("Receptionist");
    plan.roles.add("Doctor");
    plan.required_e2e.add("patient-journey");
    elevateRegression("R3");
  }
  if (/inventory|purchas|supplier|invoice|payment|financial|analytics/i.test(file)) {
    add("CROSS_IMPACT", "cross-domain", "procurement-inventory-finance");
    plan.impact.add("DATA_IMPACT");
    plan.roles.add("Finance/Accounting");
    plan.required_e2e.add("procurement-inventory-finance");
    elevateRegression("R3");
  }
  if (/i18n|locale|translation|messages/i.test(file)) add("I18N_IMPACT", "i18n");
  if (/\.tsx?$|\.mjs$|\.css$|\.json$/.test(file)) plan.impact.add("TARGET");
}

if (plan.impact.has("SECURITY_IMPACT")) elevateRegression("R3");
if (plan.impact.has("CROSS_IMPACT") && plan.regression_level === "R0") elevateRegression("R2");

const serialise = (value) => value instanceof Set ? [...value].sort() : value;
const out = process.env.TEST_EXECUTION_PLAN || "test-execution-plan.json";
const output = Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, serialise(v)]));
writeFileSync(out, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
