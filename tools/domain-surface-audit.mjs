import fs from "node:fs";
const catalog = fs.readFileSync("src/core/workspace/domainSurfaceCatalog.ts", "utf8");
const expected = ["Workspace", "Patients", "Agenda", "Treatment Plans", "Financial & Resources", "Reports", "Analytics", "Follow-up", "Patient Flow", "Operations", "Clinical", "Settings"];
const requiredFields = ["surface", "widget", "widgetRationale", "quickAction"];
const findings = [];
for (const name of expected) {
  const at = catalog.indexOf(`domain: "${name}"`);
  if (at < 0) {
    findings.push(`${name}: missing domain catalog entry`);
    continue;
  }
  if (catalog.indexOf(`domain: "${name}"`, at + 1) >= 0) findings.push(`${name}: duplicate domain catalog entry`);
  const next = catalog.indexOf("},", at);
  const block = catalog.slice(at, next > at ? next : at + 500);
  for (const field of requiredFields) if (!new RegExp(`${field}:`).test(block)) findings.push(`${name}: missing ${field}`);
}
const catalogDomains = [...catalog.matchAll(/domain: "([^"]+)"/g)].map((m) => m[1]);
for (const name of catalogDomains) if (!expected.includes(name)) findings.push(`unapproved catalog domain: ${name}`);
if (catalogDomains.length !== expected.length) findings.push(`catalog domain count ${catalogDomains.length} does not equal expected ${expected.length}`);
console.log(`Domain surface audit: ${expected.length} governed domains checked.`);
if (findings.length) { findings.forEach(console.error); process.exitCode = 1; } else console.log("All governed domains have one complete Stage 5 surface decision and no unapproved entries.");
