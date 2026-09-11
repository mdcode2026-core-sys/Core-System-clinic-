import fs from "node:fs";

const root = process.cwd();
const read = (path) => fs.readFileSync(`${root}/${path}`, "utf8");

const header = read("src/features/workspace/GlobalHeader.tsx");
const shell = read("src/features/workspace/WorkspaceShell.tsx");
const contract = read("docs/HEADER-TECHNICAL-FOUNDATION-2026-09-11.md");

const checks = [
  ["dedicated header component", header.includes("export function GlobalHeader")],
  ["semantic header landmark", header.includes("<header")],
  ["accessible mobile navigation control", header.includes("aria-expanded={mobileSidebarOpen}")],
  ["search is injected rather than reimplemented", header.includes("search?: ReactNode")],
  ["controls are injected rather than domain-owned", header.includes("controls?: ReactNode")],
  ["shell mounts GlobalHeader", shell.includes("<GlobalHeader")],
  ["existing GlobalSearch is preserved", shell.includes("search={<GlobalSearch />}")],
  ["technical foundation contract present", contract.includes("## 13. Required foundation implementation sequence")],
  ["no business launcher in header foundation", !header.includes("Quick Registration")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log(`HEADER FOUNDATION AUDIT — ${checks.length}/${checks.length} checks passed`);
}
