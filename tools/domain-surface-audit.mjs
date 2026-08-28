import fs from "node:fs";
const navigation = fs.readFileSync("src/core/navigation/navigationRegistry.ts", "utf8");
const catalog = fs.readFileSync("src/core/workspace/domainSurfaceCatalog.ts", "utf8");
const names = [...navigation.matchAll(/label:\s*\{\s*ar:\s*[^,]+,\s*en:\s*"([^"]+)"/g)].map((m) => m[1]);
const expected = ["Workspace", "Operations", "Clinical", "Treatment Plans", "Patients", "Agenda", "Financial & Resources", "Reports", "Analytics", "Follow-up", "Settings"];
const missingFromRegistry = expected.filter((name) => !names.includes(name));
const missingFromCatalog = expected.filter((name) => !catalog.includes(`domain: "${name}"`));
const missingFields = [];
for (const name of expected) {
  const at = catalog.indexOf(`domain: "${name}"`);
  const next = catalog.indexOf("},", at);
  const block = catalog.slice(at, next > at ? next : at + 500);
  for (const field of ["surface", "widget", "widgetRationale", "quickAction"]) if (!new RegExp(`${field}:`).test(block)) missingFields.push(`${name}: missing ${field}`);
}
const findings = [...missingFromRegistry.map((x) => `missing from navigation inventory: ${x}`), ...missingFromCatalog.map((x) => `missing from domain catalog: ${x}`), ...missingFields];
console.log(`Domain surface audit: ${expected.length} governed domains checked.`);
if (findings.length) { findings.forEach(console.error); process.exitCode = 1; } else console.log("All governed navigation domains have Stage 5 surface decisions.");
