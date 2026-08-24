import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(process.cwd(), "src");
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const excludedFiles = new Set(["database.types.ts"]);
const excludedPathFragments = [path.join("src", "core", "i18n")];
const technicalLiteral = /^(https?:\/\/|\/|#|[a-z0-9_:.\-/]+:[a-z0-9_:.\-/]+$|[A-Z][A-Z0-9_]*(?:\.[A-Z0-9_]+)*$)/;
const uiAttributeNames = new Set(["aria-label", "aria-description", "placeholder", "title", "alt", "label"]);
const technicalPropertyNames = new Set(["href", "id", "key", "className", "type", "name", "role", "variant", "size", "value", "method", "action", "route", "path", "permission", "permissionKey", "class", "target", "rel"]);
const ignoredCalls = new Set(["console.log", "console.error", "console.warn", "console.info", "JSON.stringify", "JSON.parse"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (extensions.has(path.extname(entry.name)) && !excludedFiles.has(entry.name)) out.push(full);
  }
  return out;
}

function isExcluded(file) {
  const relative = path.relative(process.cwd(), file);
  return excludedPathFragments.some((fragment) => relative.startsWith(fragment));
}

function normalized(text) {
  return text.replace(/\s+/g, " ").trim();
}

function isCandidate(text) {
  const value = normalized(text);
  if (!value || value.length < 2) return false;
  if (/^[0-9\s.,:/+()%-]+$/.test(value)) return false;
  if (technicalLiteral.test(value)) return false;
  if (/^(true|false|null|undefined|use[A-Z]|on[A-Z])$/.test(value)) return false;
  return /[A-Za-z\u0600-\u06FF]/.test(value);
}

function isLikelyUiLiteral(node, sf) {
  const parent = node.parent;
  if (!parent) return false;
  if (ts.isJsxText(node)) return isCandidate(node.getText(sf));
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return false;
    if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name) && technicalPropertyNames.has(parent.name.text)) return false;
    if (ts.isCallExpression(parent) && ts.isIdentifier(parent.expression) && ignoredCalls.has(parent.expression.text)) return false;
    return isCandidate(node.text);
  }
  return false;
}

const findings = [];
for (const file of walk(ROOT)) {
  if (isExcluded(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".jsx") ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  function visit(node) {
    if (isLikelyUiLiteral(node, sf)) {
      const raw = normalized(ts.isJsxText(node) ? node.getText(sf) : node.text);
      const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      findings.push({ file: path.relative(process.cwd(), file), line: pos.line + 1, kind: ts.isJsxText(node) ? "jsx-text-literal" : "string-literal", value: raw.slice(0, 200) });
    }
    if (ts.isJsxAttribute(node) && uiAttributeNames.has(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer) && isCandidate(node.initializer.text)) {
      const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      findings.push({ file: path.relative(process.cwd(), file), line: pos.line + 1, kind: "ui-attribute-literal", value: normalized(node.initializer.text).slice(0, 200) });
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

const out = path.join(process.cwd(), "i18n-audit-report.json");
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2));
console.log(`Localization source audit: ${findings.length} candidate user-facing literals found.`);
for (const finding of findings.slice(0, 300)) console.log(`${finding.file}:${finding.line} [${finding.kind}] ${finding.value}`);
process.exitCode = findings.length ? 1 : 0;
