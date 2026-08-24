import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(process.cwd(), "src/core/i18n");
const files = fs.readdirSync(ROOT).filter((name) => name.endsWith("Messages.ts") || name === "messages.ts");
const failures = [];

function objectProperty(node, name) {
  if (!ts.isObjectLiteralExpression(node)) return null;
  return node.properties.find((property) => {
    if (!ts.isPropertyAssignment(property)) return false;
    const key = property.name;
    return (ts.isIdentifier(key) || ts.isStringLiteral(key)) && key.text === name;
  }) ?? null;
}

function keyName(property) {
  const name = property.name;
  if (!name) return null;
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : null;
}

function shape(node, prefix = "") {
  if (!ts.isObjectLiteralExpression(node)) return [];
  const keys = [];
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = keyName(property);
    if (!key) continue;
    const current = prefix ? `${prefix}.${key}` : key;
    keys.push(current);
    keys.push(...shape(property.initializer, current));
  }
  return keys;
}

for (const file of files) {
  const full = path.join(ROOT, file);
  const source = fs.readFileSync(full, "utf8");
  const sf = ts.createSourceFile(full, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let found = false;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const ar = objectProperty(node.initializer, "ar");
      const en = objectProperty(node.initializer, "en");
      if (ar && en && ts.isPropertyAssignment(ar) && ts.isPropertyAssignment(en)) {
        found = true;
        const arKeys = new Set(shape(ar.initializer));
        const enKeys = new Set(shape(en.initializer));
        const missingInEn = [...arKeys].filter((key) => !enKeys.has(key));
        const missingInAr = [...enKeys].filter((key) => !arKeys.has(key));
        if (missingInEn.length || missingInAr.length) {
          failures.push({ file, missingInEn, missingInAr });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  if (!found) failures.push({ file, missingInEn: ["No AR/EN catalog object detected"], missingInAr: [] });
}

if (failures.length) {
  console.error("I18N catalog parity failed:");
  for (const failure of failures) {
    console.error(`\n${failure.file}`);
    if (failure.missingInEn.length) console.error(`  Missing in EN: ${failure.missingInEn.join(", ")}`);
    if (failure.missingInAr.length) console.error(`  Missing in AR: ${failure.missingInAr.join(", ")}`);
  }
  process.exit(1);
}

console.log(`I18N catalog parity passed for ${files.length} catalog files.`);
