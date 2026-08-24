import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(process.cwd(), "src/core/i18n");
const files = fs.readdirSync(ROOT).filter((name) => name.endsWith("Messages.ts") || name === "messages.ts");
const failures = [];

function unwrapExpression(node) {
  let current = node;
  while (current && (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current) || ts.isParenthesizedExpression(current))) {
    current = current.expression;
  }
  return current;
}

function objectProperty(node, name) {
  const expression = unwrapExpression(node);
  if (!ts.isObjectLiteralExpression(expression)) return null;
  return expression.properties.find((property) => {
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

function placeholders(value) {
  return [...value.matchAll(/\{\{?\s*([A-Za-z0-9_.-]+)\s*\}?\}|\$\{\s*([A-Za-z0-9_.-]+)\s*\}/g)]
    .map((match) => match[1] ?? match[2])
    .sort();
}

function collectLeaves(node, prefix = "", out = [], seen = new Set()) {
  const expression = unwrapExpression(node);
  if (!ts.isObjectLiteralExpression(expression)) return out;
  for (const property of expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = keyName(property);
    if (!key) continue;
    const current = prefix ? `${prefix}.${key}` : key;
    if (seen.has(current)) out.push({ type: "duplicate", key: current });
    seen.add(current);

    const valueExpression = unwrapExpression(property.initializer);
    if (ts.isObjectLiteralExpression(valueExpression)) {
      collectLeaves(valueExpression, current, out, seen);
      continue;
    }

    const value = ts.isStringLiteral(valueExpression) || ts.isNoSubstitutionTemplateLiteral(valueExpression)
      ? valueExpression.text
      : null;
    out.push({ type: "leaf", key: current, value });
  }
  return out;
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
        const arEntries = collectLeaves(ar.initializer);
        const enEntries = collectLeaves(en.initializer);
        const arLeaves = new Map(arEntries.filter((entry) => entry.type === "leaf").map((entry) => [entry.key, entry.value]));
        const enLeaves = new Map(enEntries.filter((entry) => entry.type === "leaf").map((entry) => [entry.key, entry.value]));
        const arKeys = new Set(arLeaves.keys());
        const enKeys = new Set(enLeaves.keys());
        const missingInEn = [...arKeys].filter((key) => !enKeys.has(key));
        const missingInAr = [...enKeys].filter((key) => !arKeys.has(key));
        const emptyAr = [...arLeaves].filter(([, value]) => value == null || !value.trim()).map(([key]) => key);
        const emptyEn = [...enLeaves].filter(([, value]) => value == null || !value.trim()).map(([key]) => key);
        const duplicateAr = arEntries.filter((entry) => entry.type === "duplicate").map((entry) => entry.key);
        const duplicateEn = enEntries.filter((entry) => entry.type === "duplicate").map((entry) => entry.key);
        const placeholderMismatch = [...arKeys].filter((key) => enKeys.has(key)).filter((key) => {
          const arPlaceholders = placeholders(arLeaves.get(key) ?? "");
          const enPlaceholders = placeholders(enLeaves.get(key) ?? "");
          return JSON.stringify(arPlaceholders) !== JSON.stringify(enPlaceholders);
        });

        if (missingInEn.length || missingInAr.length || emptyAr.length || emptyEn.length || duplicateAr.length || duplicateEn.length || placeholderMismatch.length) {
          failures.push({ file, missingInEn, missingInAr, emptyAr, emptyEn, duplicateAr, duplicateEn, placeholderMismatch });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  if (!found) failures.push({ file, missingInEn: ["No AR/EN catalog object detected"], missingInAr: [] });
}

if (failures.length) {
  console.error("I18N catalog integrity failed:");
  for (const failure of failures) {
    console.error(`\n${failure.file}`);
    if (failure.missingInEn?.length) console.error(`  Missing in EN: ${failure.missingInEn.join(", ")}`);
    if (failure.missingInAr?.length) console.error(`  Missing in AR: ${failure.missingInAr.join(", ")}`);
    if (failure.emptyAr?.length) console.error(`  Empty AR: ${failure.emptyAr.join(", ")}`);
    if (failure.emptyEn?.length) console.error(`  Empty EN: ${failure.emptyEn.join(", ")}`);
    if (failure.duplicateAr?.length) console.error(`  Duplicate AR: ${failure.duplicateAr.join(", ")}`);
    if (failure.duplicateEn?.length) console.error(`  Duplicate EN: ${failure.duplicateEn.join(", ")}`);
    if (failure.placeholderMismatch?.length) console.error(`  Placeholder mismatch: ${failure.placeholderMismatch.join(", ")}`);
  }
  process.exit(1);
}

console.log(`I18N catalog integrity passed for ${files.length} catalog files (AR/EN keys, non-empty values, duplicates, and placeholders).`);
