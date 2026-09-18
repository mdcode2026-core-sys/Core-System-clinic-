#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.TEST_BASE_REF || "main";
const head = process.env.TEST_HEAD_REF || "HEAD";
const changed = execFileSync("git", ["diff", "--name-only", `${base}...${head}`], { encoding: "utf8" })
  .split("\n").map((x) => x.trim()).filter(Boolean);

const laneRegistry = {
  engineering: { id: "engineering" },
  i18n: { id: "i18n" },
  "authenticated-e2e": { id: "authenticated-e2e" },
  "patient-journey": { id: "patient-journey" },
  "cross-domain": { id: "cross-domain-runtime" },
  "procurement-inventory-finance": { id: "procurement-inventory-finance" },
  "global-experience-presentation": { id: "global-experience-presentation-static" },
  "global-experience-presentation-runtime": { id: "global-experience-presentation-runtime" },
  "global-surfaces-workspace-authority": { id: "global-surfaces-workspace-authority" },
  "header-chat": { id: "header-chat-static" },
  "header-technical-foundation": { id: "header-technical-foundation-static" },
  "communications-wave-b": { id: "communications-wave-b-static" },
  "csapi-gate01-d2-database": { id: "csapi-gate01-d2-database" },
};

const commandToLane = new Map([
  ["npm run test:global-experience-presentation", "global-experience-presentation-static"],
  ["node tools/global-experience-presentation-runtime.spec.mjs", "global-experience-presentation-runtime"],
  ["npm run test:global-surfaces-workspace-authority", "global-surfaces-workspace-authority"],
  ["npm run test:header-chat", "header-chat-static"],
  ["npm run test:header-technical-foundation", "header-technical-foundation-static"],
  ["npm run test:communications-wave-b", "communications-wave-b-static"],
  ["node tools/csapi-gate01-d2-database-verification.mjs", "csapi-gate01-d2-database"],
]);

const lanes = new Map([["engineering", { id: "engineering" }]]);
const contracts = [];
const contractDir = "docs/testing/workstream-contracts";

if (existsSync(contractDir)) {
  for (const name of readdirSync(contractDir).filter((file) => file.endsWith(".execution.json"))) {
    const path = join(contractDir, name);
    const contract = JSON.parse(readFileSync(path, "utf8"));
    const patterns = contract?.applicability?.match_any;
    if (!Array.isArray(patterns)) continue;
    const applies = changed.some((file) => patterns.some((pattern) => new RegExp(pattern).test(file)));
    if (!applies) continue;

    contracts.push({
      workstream_id: contract.workstream_id,
      contract_path: contract.contract_path,
      required_suites: contract.required_suites || [],
      workstream_checks: contract.workstream_checks || [],
    });

    for (const check of contract.workstream_checks || []) {
      if (!check?.required) continue;
      const laneId = commandToLane.get(check.command);
      if (!laneId) {
        throw new Error(`UNSUPPORTED_WORKSTREAM_CHECK workstream=${contract.workstream_id} name=${check.name || "unnamed"} command=${check.command}`);
      }
      lanes.set(laneId, { id: laneId, source: contract.workstream_id, check: check.name || laneId });
    }

    for (const suite of contract.required_suites || []) {
      const mapped = laneRegistry[suite];
      if (!mapped) {
        throw new Error(`UNSUPPORTED_REQUIRED_SUITE workstream=${contract.workstream_id} suite=${suite}. Add an explicit verification lane before this workstream can run.`);
      }
      lanes.set(mapped.id, { id: mapped.id, source: contract.workstream_id, suite });
    }

    if (contract.contract_path && !existsSync(contract.contract_path)) {
      throw new Error(`WORKSTREAM_CONTRACT_MISSING ${contract.contract_path}`);
    }
  }
}

const output = {
  contract_version: "3.0",
  baseline: base,
  candidate: head,
  changed_files: changed,
  applicable_workstreams: contracts.map((c) => c.workstream_id),
  lanes: [...lanes.values()].sort((a, b) => a.id.localeCompare(b.id)),
};

console.log(JSON.stringify(output, null, 2));

if (process.env.GITHUB_OUTPUT) {
  const fs = await import("node:fs");
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${JSON.stringify({ include: output.lanes })}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_lanes=true\n`);
}
