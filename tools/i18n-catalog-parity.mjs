import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(process.cwd(), "src/core/i18n");
const files = fs.readdirSync(ROOT).filter((name) => name.endsWith("Messages.ts") || name === "messages.ts");
const failures = [];

function unwrapExpression(node) {
  let current = node;
  while (current && (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current) || ts.isParenthesizedExpression(current) || ts.isSatisfiesExpression(current))) {
    current = current.expression;
  }
  return current;
}

function keyName(property) {
  const name = property.name;
  if (!name) return null;
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : null;
}

function propertyFromObject(node, name) {
  const expression = unwrapExpression(node);
  if (!ts.isObjectLiteralExpression(expression)) return null;
  return expression.properties.find((property) => ts.isPropertyAssignment(property) && keyName(property) === name) ?? null;
}

function createVariableMap(sourceFile) {
  const variables = new Map();
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) variables.set(node.name.text, node.initializer);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return variables;
}

function resolveObject(node, variables, locale, seen = new Set()) {
  const expression = unwrapExpression(node);
  if (ts.isObjectLiteralExpression(expression)) return expression;

  if (ts.isIdentifier(expression)) {
    if (seen.has(expression.text)) return null;
    const initializer = variables.get(expression.text);
    if (!initializer) return null;
    const nextSeen = new Set(seen);
    nextSeen.add(expression.text);
    return resolveObject(initializer, variables, locale, nextSeen);
  }

  if (ts.isPropertyAccessExpression(expression)) {
    const base = resolveObject(expression.expression, variables, locale, seen);
    return propertyFromObject(base, expression.name.text)?.initializer ? resolveObject(propertyFromObject(base, expression.name.text).initializer, variables, locale, seen) : null;
  }

  if (ts.isElementAccessExpression(expression) && expression.argumentExpression && ts.isStringLiteral(expression.argumentExpression)) {
    const base = resolveObject(expression.expression, variables, locale, seen);
    return propertyFromObject(base, expression.argumentExpression.text)?.initializer ? resolveObject(propertyFromObject(base, expression.argumentExpression.text).initializer, variables, locale, seen) : null;
  }

  return null;
}

function placeholders(value) {
  return [...value.matchAll(/\{\{?\s*([A-Za-z0-9_.-]+)\s*\}?\}|\$\{\s*([A-Za-z0-9_.-]+)\s*\}/g)]
    .map((match) => match[1] ?? match[2])
    .sort();
}

function collectLeaves(node, variables, prefix = "", out = [], seen = new Set()) {
  const expression = resolveObject(node, variables);
  if (!expression) return out;
  for (const property of expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = keyName(property);
    if (!key) continue;
    const current = prefix ? `${prefix}.${key}` : key;
    if (seen.has(current)) out.push({ type: "duplicate", key: current });
    seen.add(current);

    const nested = resolveObject(property.initializer, variables);
    if (nested) {
      collectLeaves(nested, variables, current, out, seen);
      continue;
    }

    const valueExpression = unwrapExpression(property.initializer);
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
  const variables = createVariableMap(sf);
  let found = false;

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const root = resolveObject(node.initializer, variables);
      const ar = propertyFromObject(root, "ar");
      const en = propertyFromObject(root, "en");
      if (ar && en) {
        found = true;
        const arEntries = collectLeaves(ar.initializer, variables);
        const enEntries = collectLeaves(en.initializer, variables);
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
