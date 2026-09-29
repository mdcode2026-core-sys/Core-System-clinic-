# CORE SYSTEM — CSAPI Gate 04 — Agenda & Scheduling
## Implementation Plan & Team Work Package Allocation

**Date:** 2026-09-29
**Status:** PLAN FROZEN — IMPLEMENTATION NOT STARTED
**Engineering Owner:** AI Engineering Leader / CTO
**Base main:** 69405d65c6d282b4f703743a81df5252bec73bcc

## 1. Leadership model
The AI Engineering Leader owns technical sequencing, architecture integrity, dependency resolution, work-package boundaries, evidence quality, failure classification and final engineering closure.
The Founder/Product Owner owns product decisions. No new product decision is required by the current design.
Team functions are responsibility boundaries; they may be combined by the Engineering Leader, but independent verification must remain independent.

## 2. Work package map

| WP | Work package | Primary function | Supporting functions | Depends on | Exit condition |
|---|---|---|---|---|---|
| WP-0 | Design / contract freeze | AI Engineering Leader + Solution Architect | BA, QA, Documentation | Decision freeze | Contract + design + plan + verification plan frozen |
| WP-1 | Canonical mutation convergence + DB command boundary | Backend / Domain | DB, Security, Frontend, QA | WP-0 | All active Appointment writes converge on server authority and protected DB persistence commands; direct table writes denied |
| WP-2 | Feasibility / booking requirements | Solution Architect + Backend | Clinical Advisor, Workforce, DB, QA | WP-0 | Provider/room/resource requirements have one explicit contract |
| WP-3 | Resource concurrency policy | Solution Architect | DB, Resource owner, Backend, QA | WP-2 | Default exclusivity + explicit policy boundary proven |
| WP-4 | Appointment audit completion | DB / PostgreSQL | Backend, Security, QA | WP-1 | CREATE + UPDATE + lifecycle mutations reconstructible |
| WP-5 | UI / entry-surface convergence | Frontend / Product Engineer | UX, i18n, Backend, QA | WP-1, WP-2 | Calendar/Quick Appointment/form writes use canonical server path |
| WP-6 | Verification infrastructure | QA / SDET | DevOps, Backend, DB, Security | WP-1..WP-5 design completion | Binding Gate 04 test contract + executable lanes ready |
| WP-7 | Integrated verification | QA / SDET | Security, Backend, Frontend, Workforce, Clinical Advisor | WP-6 | Positive + negative + cross-domain E2E evidence PASS |
| WP-8 | Release / closure | DevOps / SRE + AI Engineering Leader | QA, Security, Documentation | WP-7 | Exact main SHA production verified and Gate 04 closure reconciled |

## 3. Function-level responsibilities

### AI Engineering Leader / CTO
- Guard architecture and Gate ownership.
- Resolve cross-domain conflicts.
- Approve technical design within product-approved scope.
- Decide whether a finding is Gate 04, future gate, or regression of a closed gate.
- Prevent duplicate engines and scope drift.
- Own final review and closure recommendation.

### Product Manager / Business Analyst
- Map Gate 04 behavior to approved scenarios/contracts.
- Confirm existing product terminology and acceptance language.
- Surface a product decision only if implementation evidence reveals a true product ambiguity.
- Do not silently redefine Agenda ownership.

### Principal / Solution Architect
- Maintain the Owner → Source → Execution Path → Integration Contract model.
- Define the BookingRequirementSet and concurrency policy boundaries.
- Reconcile R02/R04/R05 with Gate 04 without turning them into competing authorities.

### Backend / Domain Engineer
- Refactor Appointment mutation authority.
- Integrate protected DB command boundary for create/update/transition/cancel.
- Ensure DB command functions do not duplicate availability/conflict engines.
- Implement provider optionality and feasibility pipeline.
- Build the Service/Procedure requirement adapter.
- Preserve stable error contracts and existing engines.

### Database / PostgreSQL / Supabase Engineer
- Design and implement the protected Agenda DB mutation command boundary.
- Revoke alternate authenticated/anonymous write access to appointment table after caller migration.
- Design and implement the canonical audit extension.
- Design any minimal booking-requirement or concurrency policy persistence only after source ownership is proven.
- Preserve tenant-safe foreign keys, RLS and exclusion constraints.
- Reconcile repository migration order against Live migration history before deployment.

### Frontend / Product Engineer
- Replace active direct mutation hooks with server-action adapters.
- Preserve existing Agenda/Calendar/Quick Appointment UX unless a proven workflow defect requires a focused change.
- Keep tenant-local wall-clock semantics in input/display.

### QA / SDET
- Convert the binding contract into executable Gate 04 scenarios.
- Build deterministic local/authenticated E2E and negative/security coverage.
- Trace every failure to the first concrete violated invariant.
- Maintain evidence artifacts and exact candidate identity.

### Security Engineer
- Verify permission checks, RLS, tenant isolation and cross-tenant reference rejection.
- Verify a browser/authenticated client cannot write Appointment rows directly.
- Verify only the trusted server command boundary can mutate appointment persistence.
- Verify audit disclosure boundaries.
- Verify lifecycle mutations cannot bypass authorization.

### DevOps / Platform / SRE
- Add Gate 04 to the existing verification orchestration only once its workstream contract is ready.
- Preserve SETUP → Engineering → E2E → Reconciliation governance.
- Manage exact-candidate release gating and Production verification; no routine Vercel use during implementation.

### Product Designer / UX + i18n
- Reconcile stable Agenda error codes with localized user messages.
- Keep internal audit detail out of normal user UI.
- Avoid adding new visual architecture to solve backend ownership problems.

### Clinical / Healthcare Domain Advisor
- Validate provider/service semantics and clinical vs operational boundaries where needed.
- No authority over scheduling implementation or product scope.

### Technical Writer / Documentation Engineer
- Keep Gate Plan, Handoff, Ledger, Contract, Verification Plan and closure records synchronized.
- Mark historical/superseded documents clearly.

### Data / BI and AI / ML
- Not active implementation owners for Gate 04.
- Consult only where audit/appointment fields have future analytical consequences; no new analytics engine in this gate.

## 4. Implementation sequencing
1. WP-1 canonical mutation path.
2. WP-2 booking requirement / provider feasibility contract.
3. WP-3 concurrency policy boundary.
4. WP-4 audit completion.
5. WP-5 UI convergence.
6. WP-6 executable verification contract and lanes.
7. WP-7 integrated authenticated verification.
8. WP-8 exact-candidate release and closure.

Implementation must remain one coherent Gate 04 workstream branch for material code/database changes. Do not create a PR for every WP.

## 5. Evidence gates
Each work package has an exit condition. A later WP cannot hide a failed earlier invariant.
Required overall sequence:
`Design Freeze → Implementation → Build → Engineering → Clean DB Migration → Database/Security → Authenticated E2E → Cross-domain E2E → Review → Production Verification → Closure`.

## 6. Scope protection
Gate 04 explicitly excludes:
- Patient Flow rebuild;
- Patient Identity rebuild;
- Treatment Plan redesign;
- Follow-up implementation;
- Inventory stock/consumption engine;
- Workforce cleanup;
- second Scheduler/Calendar engine;
- generic Resource Engine.

## 7. Current known implementation gaps entering WP-1..WP-5
- Direct client mutation hooks exist in `agenda.queries.ts`.
- Live authenticated/anonymous table grants permit direct Appointment writes today; this is a Gate 04 security/authority gap that must be closed after caller migration.
- Provider is hard-required in current Agenda TypeScript/server types.
- Current procedure-resource validator is inactive and historical.
- Current Agenda audit trigger/function only covers UPDATE.
- Current resource/room conflict enforcement is exclusive while D04-01 requires policy-driven extensibility.
- Workforce has legacy fallback sources which must remain outside Gate 04 cleanup.

## 8. Branch and PR policy
- This design/plan branch contains documentation only.
- After design merge, create one controlled implementation branch from the verified current main.
- Combine coherent Agenda changes into one workstream PR unless evidence requires a separate isolated migration correction.
- No direct main implementation.

## 9. Definition of Ready for implementation
Implementation may start only when:
- Gate 04 implementation design is merged;
- Execution Contract and Verification Plan are merged;
- all WP dependencies are understood;
- no unresolved Product Owner decision remains;
- migration strategy is isolated and reconciled;
- test-lane impact is explicitly mapped.

## 10. Definition of Done for Gate 04
Gate 04 is done only after technical implementation, automated evidence, runtime evidence, cross-domain ownership review, exact production verification where required, and synchronized documentation all agree.
