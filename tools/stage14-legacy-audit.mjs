import { execFileSync } from "node:child_process";

const checks = [
  { id: "LEGACY-ROLE-001", pattern: "clinic_owner", scope: ["src"] },
  { id: "LEGACY-FLAG-001", pattern: "ADVANCED_ANALYTICS", scope: ["src"] },
  { id: "LEGACY-TENANT-001", pattern: "from('tenants'", scope: ["src"] },
  { id: "LEGACY-TENANT-002", pattern: 'from("tenants"', scope: ["src"] },
  { id: "LEGACY-ROUTE-001", pattern: "/legacy/", scope: ["src/app"] },
];

let findings = 0;
for (const check of checks) {
  let output = "";
  try { output = execFileSync("git", ["grep", "-n", "-F", "--", check.pattern, ...check.scope], { encoding: "utf8" }); } catch (error) { if (error.status === 1) output = ""; else throw error; }
  if (output.trim()) {
    findings += 1;
    console.error(`FOUND ${check.id}: ${check.pattern}`);
    console.error(output.trim());
  } else {
    console.log(`PASS ${check.id}: ${check.pattern}`);
  }
}

if (findings) {
  console.error(`Stage 14 legacy audit found ${findings} candidate(s). No automatic deletion is permitted by this gate.`);
  process.exit(1);
}
console.log("Stage 14 legacy audit PASS: no proven obsolete identifiers in active source surfaces.");
