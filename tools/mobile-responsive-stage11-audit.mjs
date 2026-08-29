import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function includes(relativePath, needle, description) {
  const source = read(relativePath);
  assert(source.includes(needle), `${relativePath} — ${description}`);
}

console.log("Stage 11 — Mobile + Responsive Workflow audit");

// Final production-candidate verification marker; this audit is intentionally behavior-neutral.
// Device viewport and global overflow safety.
includes("src/app/layout.tsx", "export const viewport", "declares an explicit responsive viewport");
includes("src/app/globals.css", "overflow-x: clip", "prevents accidental page-level horizontal overflow");

// Canonical dashboard shell: mobile drawer + usable touch targets + responsive main surface.
includes("src/features/workspace/EntitlementAwareWorkspaceShell.tsx", "lg:hidden", "uses a mobile-only sidebar backdrop");
includes("src/features/workspace/EntitlementAwareWorkspaceShell.tsx", "translate-x-full", "supports RTL mobile drawer behavior");
includes("src/features/workspace/EntitlementAwareWorkspaceShell.tsx", "min-h-10 min-w-10", "keeps primary mobile shell controls touch-friendly");
includes("src/features/workspace/EntitlementAwareWorkspaceShell.tsx", "overflow-y-auto", "keeps navigation and main content independently scrollable");

// Workspace: natural vertical flow, responsive grids, and non-drag fallback for touch devices.
includes("src/features/workspace/WorkspaceRenderer.tsx", "grid grid-cols-1", "collapses Workspace content to a single column on small screens");
includes("src/features/workspace/WorkspaceRenderer.tsx", "md:grid-cols-2", "uses responsive medium-screen Workspace columns");
includes("src/features/workspace/WorkspaceRenderer.tsx", "xl:grid-cols-3", "uses wider layouts only when screen capacity permits");
includes("src/features/workspace/WorkspaceRenderer.tsx", "min-h-9 min-w-9", "provides touch-friendly mobile reorder controls");

// Widget surfaces must not introduce their own horizontal overflow and controls need touch targets.
includes("src/features/workspace/WidgetContainer.tsx", "min-w-0", "allows widget content to shrink within the responsive grid");
includes("src/features/workspace/WidgetToolbar.tsx", "min-h-9 min-w-9", "keeps widget controls usable on touch screens");

// Shared primitives used by forms/tables/dialogs must remain mobile-safe.
includes("src/shared/components/ui/table.tsx", "overflow-auto", "provides horizontal scrolling for wide tables instead of page overflow");
includes("src/shared/components/ui/dialog.tsx", "max-h-[calc(100vh-2rem)]", "keeps dialogs within the mobile viewport");
includes("src/shared/components/ui/dialog.tsx", "overflow-y-auto", "allows long mobile dialogs to scroll internally");

// Critical Stage 0–10 integrated surfaces.
includes("src/app/(dashboard)/patient-flow/page.tsx", "grid gap-4 md:grid-cols-3", "Patient Flow cards stack on small screens");
includes("src/core/search/GlobalSearch.tsx", "max-h-[min(70vh,32rem)]", "Global Search results stay within the viewport");
includes("src/core/search/GlobalSearch.tsx", "min-w-0 flex-1", "Global Search input/result content can shrink without overflow");

// Responsive controls must not rely on fixed desktop-only widths.
const criticalFiles = [
  "src/features/workspace/EntitlementAwareWorkspaceShell.tsx",
  "src/features/workspace/WorkspaceRenderer.tsx",
  "src/features/workspace/WidgetContainer.tsx",
  "src/features/workspace/WidgetToolbar.tsx",
  "src/core/search/GlobalSearch.tsx",
  "src/app/(dashboard)/patient-flow/page.tsx",
];
for (const file of criticalFiles) {
  const source = read(file);
  assert(!/className=[^\n]*\bw-(?:screen|full)\b/.test(source) || source.includes("max-w-"), `${file} — no unbounded fixed full-width critical surface without a bounded container`);
}

if (process.exitCode) {
  console.error("Stage 11 audit FAILED.");
  process.exit(1);
}

console.log("Stage 11 audit PASSED.");
