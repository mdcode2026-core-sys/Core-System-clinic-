import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "src/core/workspace/widgetRegistry.ts");
const catalogPath = path.join(root, "src/core/workspace/widgetCatalog.ts");

const registry = fs.readFileSync(registryPath, "utf8");
const catalog = fs.readFileSync(catalogPath, "utf8");

const registryKeys = [...registry.matchAll(/key:\s*["']([^"']+)["']/g)].map((m) => m[1]);
const catalogKeys = [...catalog.matchAll(/^\s*["']?([a-z0-9-]+)["']?:\s*\{/gm)].map((m) => m[1]);

const uniqueRegistry = [...new Set(registryKeys)];
const uniqueCatalog = [...new Set(catalogKeys)];
const missing = uniqueRegistry.filter((key) => !uniqueCatalog.includes(key));
const orphaned = uniqueCatalog.filter((key) => !uniqueRegistry.includes(key));
const duplicates = uniqueRegistry.filter((key, index) => registryKeys.indexOf(key) !== index);

const requiredFields = ["surfaceKind", "domainOwner", "purpose", "purposeAr", "contexts", "naturalSize", "sidebarCapability", "quickAction", "rationale"];
const fieldFindings = [];
for (const key of uniqueRegistry) {
  const start = catalog.indexOf(`${key}: {`);
  const quotedStart = catalog.indexOf(`"${key}": {`);
  const at = Math.max(start, quotedStart);
  if (at < 0) continue;
  const end = catalog.indexOf("\n  },", at);
  const block = catalog.slice(at, end > at ? end : at + 2500);
  for (const field of requiredFields) if (!new RegExp(`\\b${field}:`).test(block)) fieldFindings.push(`${key}: missing ${field}`);
}

const failures = [...missing.map((key) => `missing classification: ${key}`), ...orphaned.map((key) => `orphaned classification: ${key}`), ...duplicates.map((key) => `duplicate registry key: ${key}`), ...fieldFindings];
console.log(`Widget catalog audit: ${uniqueRegistry.length} registry widgets, ${uniqueCatalog.length} classifications.`);
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
} else {
  console.log("All registered widgets have complete Stage 5 classification metadata.");
}
