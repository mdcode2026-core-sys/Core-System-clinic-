import { readFileSync, existsSync } from "node:fs";

// The dated Global UX/IA execution artifacts below were superseded/neutralized before this
// remediation. Stage 15 must validate the current documentation authority, not require retired
// execution-plan files to be resurrected.
const required = [
  "DOCUMENTATION_STATUS.md",
  "PROJECT_HANDOFF.md",
  "MASTER_ROADMAP.md",
  "ARCHITECTURE_DECISIONS.md",
  "ENGINEERING_CONSTITUTION.md",
  "docs/STAGE12-IMPLEMENTATION-RECORD-2026-08-29.md",
  "docs/STAGE12-CLOSURE-PRODUCTION-READINESS-2026-08-29.md",
  "docs/STAGE13-IMPLEMENTATION-RECORD-2026-08-29.md",
  "docs/STAGE13-CLOSURE-PRODUCTION-READINESS-2026-08-29.md",
  "docs/STAGE14-IMPLEMENTATION-RECORD-2026-08-29.md",
  "docs/STAGE14-CLOSURE-PRODUCTION-READINESS-2026-08-29.md",
  "docs/STAGE15-DOCUMENTATION-CLOSURE-2026-08-29.md",
  "docs/STAGES12-15-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md",
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) { console.error("Missing required documentation:", missing); process.exit(1); }
const status = readFileSync("DOCUMENTATION_STATUS.md", "utf8");
const handoff = readFileSync("PROJECT_HANDOFF.md", "utf8");
if (/Global UX\/IA Stage 11 CLOSED — PRODUCTION READY/.test(status)) { console.error("Stale Stage 11 production-ready authority remains"); process.exit(1); }
if (/Global UX\/IA Stage 11 CLOSED — PRODUCTION READY/.test(handoff)) { console.error("Stale Stage 11 production-ready handoff remains"); process.exit(1); }
if (!status.includes("Production SHA = final main SHA")) { console.error("Production SHA integrity rule missing from documentation status"); process.exit(1); }
if (!handoff.includes("Production Ready requires repository SHA, CI, Production deployment SHA/status and runtime verification")) { console.error("Production verification rule missing from handoff"); process.exit(1); }
console.log("Stage 15 documentation consistency audit PASS");
