# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-15
**Current Branch:** `feat/visual-design-constitution-f1-f4-2026-09-15`
**Base:** `docs/ux-experience-governance-foundation-2026-09-14`
**Current Candidate:** PR #125 / `6197b251730b645d25b50d631e68c00868df0260`

## Current Objective
Implement the Product Owner-approved **Concept 01 — Clinical Precision** visual foundation and apply it to F1–F4 without reopening closed product decisions.

## Authority
The active authority stack is:
1. Experience Constitution & Governance
2. Experience Decision Registry
3. Integrated Experience Work Contract
4. Experience Execution Gate
5. Visual Design Constitution
6. Visual Token Specification
7. Surface Visual Application Matrix
8. Visual Execution Contract

`VIS-001` and `VIS-002` record Concept 01 and the visual governance layer as APPROVED. Runtime acceptance remains OPEN.

## F1–F4 Scope
- **F1 Login:** Clinical Precision visual translation; authentication architecture and behavior preserved.
- **F2 Header:** independent Brand/Home, Search, Communications, Chat, Notifications, Quick Actions; mega-pill treatment removed; functional surfaces preserved.
- **F3 Home:** Simple + Contextual; Identity/Context → Today → Destinations; prohibited Home content removed; Today appointments preserve user context.
- **F4 Home → Workspace:** explicit transition; Agenda entry preserves authenticated clinic-user context through existing `doctor_id` semantics.

## Functional Boundary
Today's appointment context uses the authenticated `clinic_users.id` and the existing Agenda `master_agenda_events.doctor_id` relationship. Agenda remains the authoritative scheduling engine. No second scheduling engine was introduced.

No database migration, permission-model rewrite, duplicate domain engine, Vercel deployment, or Work Center redesign is in scope.

## Documentation State
Visual governance documents are present in `docs/` and referenced by the Experience Constitution, Decision Registry, Work Contract, and Execution Gate.

**Important reconciliation item:** the root `CORE_SYSTEM_EXECUTION_LEDGER.md` still contains the historical 2026-09-09 ledger and has not yet been safely reconciled because the available GitHub file interface cannot append to a large existing file without replacing its full contents. Do not treat that historical ledger as current-cycle evidence. A current-cycle ledger reconciliation must be completed before final closure.

## Verification State — NOT CLOSED

### Automated validation
**NOT VERIFIED.**

The candidate commit currently has **no GitHub Actions PR workflow run**. The repository's unified test workflow is configured for pull requests targeting `main`; PR #125 targets the governance branch, so the workflow does not automatically execute for this PR. This is an execution/infrastructure condition, not a test pass.

### Runtime visual verification
**NOT VERIFIED.**

No runtime browser evidence has yet been captured for Login, Header, Home, or Home → Workspace on the candidate. Vercel has intentionally not been used because this phase does not authorize production deployment.

### Accessibility / responsive verification
**NOT VERIFIED.**

Desktop/tablet/mobile, RTL/LTR, keyboard/focus, and touch-target verification still require objective evidence.

### Product Owner gate
**PENDING.**

Concept 01 itself is already APPROVED and must not be reopened. Final runtime acceptance of F1–F4 remains a closure gate.

## Known Review Points
1. Home currently excludes `no_show` from the appointment count in addition to `cancelled`; this must be confirmed against the existing Agenda/Home contract during validation rather than silently assumed.
2. Agenda's `doctorId` context is applied to the existing loaded Agenda events client-side; this must be verified for authorization and data-scope correctness during automated/runtime testing.
3. The Home welcome state is implemented with a session-storage marker and WorkspaceShell pathname transition; runtime verification must confirm first-entry versus subsequent navigation behavior.

These are verification points, not new product decisions.

## Closure Rule
F1–F4 are **NOT CLOSED** until:
- automated engineering/execution validation passes;
- runtime visual evidence passes;
- responsive and RTL/LTR checks pass;
- accessibility/focus/touch checks pass;
- no authorization/data-scope regression is found;
- execution handoff and ledger are reconciled with current evidence;
- Product Owner accepts the final runtime result.

**Current status: IMPLEMENTATION PRESENT / VERIFICATION OPEN / NOT CLOSED.**
