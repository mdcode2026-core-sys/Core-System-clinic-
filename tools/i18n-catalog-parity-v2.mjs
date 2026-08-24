import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "src/core/i18n");
const files = fs.readdirSync(root).filter((file) => /Messages\.ts$/.test(file) || file === "messages.ts");
const catalogs = [];

function extractKeys(source) {
  const keys = new Set();
  const re = /^\s*([A-Za-z_$][\w$]*)\s*:/gm;
  let match;
  while ((match = re.exec(source))) keys.add(match[1]);
  return keys;
}

for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const arMatch = source.match(/(?:^|\n)\s*ar\s*:\s*\{([\s\S]*?)\n\s*\}\s*,?\s*\n\s*en\s*:/);
  const enMatch = source.match(/(?:^|\n)\s*en\s*:\s*\{([\s\S]*?)\n\s*\}\s*,?\s*\n?\s*\}?\s*;?\s*$/);
  if (!arMatch || !enMatch) continue;
  catalogs.push({ file, ar: extractKeys(arMatch[1]), en: extractKeys(enMatch[1]) });
}

const errors = [];
for (const catalog of catalogs) {
  for (const key of catalog.ar) if (!catalog.en.has(key)) errors.push(`${catalog.file}: missing EN key ${key}`);
  for (const key of catalog.en) if (!catalog.ar.has(key)) errors.push(`${catalog.file}: missing AR key ${key}`);
}

console.log(`Checked ${catalogs.length} localization catalogs.`);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log("AR/EN catalog parity: PASS");
}
