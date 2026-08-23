import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(process.cwd(), "src");
const extensions = new Set([".ts", ".tsx"]);
const excluded = new Set(["database.types.ts"]);
const arabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const latin = /[A-Za-z]/;
const uiAttributeNames = new Set(["aria-label", "aria-description", "placeholder", "title", "alt"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (extensions.has(path.extname(entry.name)) && !excluded.has(entry.name)) out.push(full);
  }
  return out;
}

function text(node, source) { return source.slice(node.getStart(source), node.getEnd()); }
function isLikelyUiLiteral(node) {
  const parent = node.parent;
  if (!parent) return false;
  if (ts.isJsxText(node)) return true;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return false;
    if (ts.isCallExpression(parent) && parent.expression.getText().includes("from")) return false;
    if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name) && /^(href|id|key|className|type|name|role|variant|size|value|method|action|route|path|permission|permissionKey)$/.test(parent.name.text)) return false;
    return true;
  }
  return false;
}

const findings = [];
for (const file of walk(ROOT)) {
  const source = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if (isLikelyUiLiteral(node)) {
      const raw = ts.isJsxText(node) ? node.getText(sf).trim() : node.text;
      if (raw && arabic.test(raw)) {
        const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        findings.push({ file: path.relative(process.cwd(), file), line: pos.line + 1, kind: "arabic-ui-literal", value: raw.slice(0, 160) });
      }
    }
    if (ts.isJsxAttribute(node) && uiAttributeNames.has(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) {
      if (arabic.test(node.initializer.text)) {
        const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        findings.push({ file: path.relative(process.cwd(), file), line: pos.line + 1, kind: "arabic-ui-attribute", value: node.initializer.text.slice(0, 160) });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

const out = path.join(process.cwd(), "i18n-audit-report.json");
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2));
console.log(`Localization audit: ${findings.length} Arabic UI literals/attributes found.`);
for (const finding of findings.slice(0, 200)) console.log(`${finding.file}:${finding.line} [${finding.kind}] ${finding.value}`);
process.exitCode = findings.length ? 1 : 0;
