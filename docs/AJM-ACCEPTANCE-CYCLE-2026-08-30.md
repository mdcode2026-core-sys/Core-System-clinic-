# CORE SYSTEM — AJM Acceptance Cycle 2026-08-30

**Authority:** `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`
**Production branch:** `main`
**Acceptance rule:** Historical `CLOSED` labels are not accepted as current evidence. AJM-0 → AJM-8 are treated as unexecuted for this cycle until their current state-machine gates are satisfied.

## 1. Current release identity

- Current `main` SHA: `e43bbdf0acaebeb69b9f8ae33f8e52c323da40bb`
- Integrated application/tested SHA immediately before the documentation-only head: `9d20c6a0f039966f6ea5f13ede1ac3bcc9bf1563`
- Commit comparison: `e43bbdf` is exactly one commit ahead of `9d20c6a`; the only changed file is `docs/AJM-INTEGRATED-EXECUTION-RECORD-2026-08-29.md`. Therefore the production deployment at `e43bbdf` contains the same application/runtime code as the tested integrated candidate.
- Current Vercel Production deployment: `dpl_DUPBPyXtiTt58qHzSGdYvmMJqqZK`
- Vercel state: `READY`, target `production`, branch `main`, SHA `e43bbdf0acaebeb69b9f8ae33f8e52c323da40bb`

## 2. Pre-Stage Audit — AJM-0

### AJM contract
The full AJM execution prompt, implementation plan, unified UX/IA plan and reconciliation artifacts are present on `main` and are treated as the governing acceptance sources.

### UX / IA
The current release retains the canonical navigation registry and the integrated AJM product surfaces. Navigation is presentation; authorization remains permission-driven.

### PJ
PJ remains the patient-centered journey authority. AJM does not create a second Patient Journey, Agenda, Visit, Treatment Plan, Follow-up or Queue source of truth.

### GitHub / code
The integrated AJM-3 → AJM-8 release candidate is merged to `main` via PR #55. Non-production validation was recorded as passing before the production gate.

### Supabase
Live project: `qaslsjyxjwvdoiczmhgq`. The dependency-ordered AJM migration sequence is present in live migration history: `20260829160000`, `20260829160500`, `20260829161500`, `20260829170000`, `20260829173000`, `20260829180000`, `20260829190000`.

### Runtime
Vercel Production is currently `READY`. The current production deployment has no error/warning runtime logs in the checked two-hour window.

### AJM-0 result
**Implementation/readiness evidence: PASS. Acceptance closure: PENDING** because the current-cycle production/authenticated state machine still requires authenticated production evidence.

## 3. Pre-Stage Audit — AJM-1

### AJM ↔ UX/IA
The Team & Access foundation exists in the repository and is surfaced from Settings through the dedicated Team & Access entry. Existing role, permission, override, workspace and user-setting managers remain canonical; no duplicate authorization engine was introduced.

### PJ boundary
Team & Access is administrative infrastructure and does not own patient-journey entities.

### GitHub / code
Historical AJM-1 implementation is present and was followed by a visibility/discoverability correction. Current-cycle acceptance treats the implementation as evidence only.

### Supabase
Permission, role-template, workspace and user-setting structures exist in the live schema. Current Supabase advisors still report several intentionally callable SECURITY DEFINER functions and other legacy/performance warnings; these are not silently reclassified as closure evidence.

### Runtime
Production deployment is `READY`; unauthenticated production access is observable. Authenticated authorization scenarios cannot be executed with the currently available tool environment.

### AJM-1 result
**Implementation evidence: PASS. Acceptance closure: BLOCKED by approved authenticated production E2E identity/session dependency (Issue #53).**

## 4. Pre-Stage Audit — AJM-2

### AJM ↔ UX/IA
AJM-2 is implemented as one coherent Financial & Resources product surface. Canonical `/invoices` and `/inventory` implementations are reused; subordinate capabilities are nested rather than exposed as duplicate root products.

### PJ boundary
Financial & Resources supports the journey but does not replace PJ, Clinical, Agenda or Follow-up ownership.

### GitHub / code
`docs/AJM-2-IMPLEMENTATION-LOG.md` records the stage as implementation-complete at the code/schema level but still behind the authenticated E2E/closure gate.

### Supabase
Live financial/AJM foundations are present. The AJM migration sequence is recorded in live migration history.

### Runtime
Production deployment is `READY`; authenticated workflow validation remains unavailable.

### AJM-2 result
**Implementation evidence: PASS. Acceptance closure: BLOCKED by Issue #53.**

## 5. Pre-Stage Audit — AJM-3

### AJM ↔ UX/IA
The integrated release contains a canonical `/workforce` surface and a single Workforce & Operations domain. Workforce does not create a second appointment/calendar engine.

### PJ / Agenda boundary
Workforce provides staffing/capacity inputs. Agenda remains the canonical appointment scheduler. Employee remains distinct from User.

### GitHub / code
`src/domain/workforce/*`, `/workforce`, and the AJM-3 migrations are present on the current `main` release. PR #55 integrated the release candidate after non-production validation.

### Supabase
Workforce tables are live and RLS-enabled, including employees, employment records, schedules, attendance, leave, payroll and commissions.

### Runtime
Production deployment is `READY`; no runtime errors/warnings were returned for the checked window. Authenticated workforce workflows cannot yet be executed.

### AJM-3 result
**Implementation and live-schema evidence: PASS. Acceptance closure: BLOCKED by Issue #53.**

## 6. Pre-Stage Audit — AJM-4

### AJM ↔ UX/IA
Communications is implemented as an internal/operational communication foundation that reuses existing Patient Portal messaging/notification infrastructure rather than creating a parallel notification platform.

### PJ boundary
Patient communication remains connected to the patient journey without moving patient ownership out of PJ/Portal domains.

### GitHub / code + Supabase
Communication conversations, participants, messages, requests and related RLS/tenant-bound constraints are present in the integrated release and live schema.

### Runtime
Production is `READY`; authenticated send/read/request scenarios remain unverified.

### AJM-4 result
**Implementation/live-schema evidence: PASS. Acceptance closure: BLOCKED by Issue #53.**

## 7. Pre-Stage Audit — AJM-5

### AJM ↔ UX/IA
Journey Coordination uses one canonical `operational_work_items` model with history and Work Center. No second generic task/workflow engine was introduced.

### PJ boundary
Coordination links to patient/clinical/agenda/financial contexts without taking ownership of those source domains.

### GitHub / code + Supabase
Operational work items/history and related tenant-bound references are present and RLS-enabled.

### Runtime
Production is `READY`; authenticated create/assign/transition/history scenarios remain unverified.

### AJM-5 result
**Implementation/live-schema evidence: PASS. Acceptance closure: BLOCKED by Issue #53.**

## 8. Pre-Stage Audit — AJM-6

### AJM ↔ UX/IA
Insights extends the existing KPI registry/engine and does not create a parallel analytics source of truth. Workforce, communications and coordination are integrated as KPI categories.

### PJ boundary
Insights consumes journey/domain events and does not replace PJ or clinical ownership.

### GitHub / code
The integrated release passed the recorded analytics typing/static validation after the defects found during candidate acceptance were corrected.

### Runtime
Production is `READY`; authenticated tenant-specific dashboard verification remains unavailable.

### AJM-6 result
**Non-production implementation/validation evidence: PASS. Acceptance closure: BLOCKED by Issue #53.**

## 9. Pre-Stage Audit — AJM-7

### AJM ↔ UX/IA/PJ
Cross-domain references preserve source-of-truth ownership across Agenda, Clinical, Financial, Workforce, Communications, Follow-up and PJ. Communications ↔ Coordination links are explicit.

### GitHub / code + Supabase
AJM-7 cross-domain migration is present in live migration history and tenant-bound references are enforced by composite-key constraints in the integrated release.

### Runtime
Production is `READY`; end-to-end authenticated cross-domain scenarios remain unverified.

### AJM-7 result
**Integration/static/live-schema evidence: PASS. Acceptance closure: BLOCKED by Issue #53.**

## 10. Pre-Stage Audit — AJM-8

### Security / authorization
The integrated AJM-8 migration hardens RLS and tenant-bound references. Supabase advisors still show warnings, including intentionally callable SECURITY DEFINER functions, public-schema extensions and performance-policy findings. These are recorded evidence and must not be represented as zero-warning closure.

### GitHub / static validation
The integrated non-production validation record reports TypeScript, lint, I18N, UX 0-8, Stage 8-15, runtime E2E, legacy cleanup, AJM static audit and migration-sequence audit passing before the production gate.

### Runtime / production
Current production is `READY` and has no checked runtime error/warning logs. Authenticated production authorization and tenant-isolation verification remain unexecuted.

### AJM-8 result
**Security/static/live production deployment evidence: PASS. Final closure: BLOCKED by Issue #53.**

## 11. Blocker / Decision Protocol

### Blocker B-01 — authenticated Production E2E identity/session
GitHub Issue #53 remains open. It is a genuine external verification dependency: the current tool environment does not expose a safe authenticated browser session or an approved production test identity/session. No credentials are invented and no authenticated result is fabricated.

This blocker prevents closure of any stage whose Definition of Done requires authenticated production workflows, authorization proof or tenant-isolation proof.

### Resolved blocker B-02 — Vercel deployment rate limit
GitHub Issue #54 is resolved. A current `READY` Production deployment is verified at `e43bbdf0acaebeb69b9f8ae33f8e52c323da40bb`, and the production runtime has no errors/warnings in the checked window.

## 12. Current state machine

| Stage | Current-cycle state |
|---|---|
| AJM-0 | PRECHECK PASS / CLOSURE PENDING |
| AJM-1 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-2 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-3 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-4 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-5 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-6 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-7 | IMPLEMENTED / ACCEPTANCE BLOCKED |
| AJM-8 | IMPLEMENTED / FINAL CLOSURE BLOCKED |

**No stage is marked CLOSED by this record.**

## 13. Required continuation

1. Preserve the current integrated release; do not invent a parallel architecture to bypass the blocker.
2. When an approved authenticated Production E2E identity/session or an approved automated E2E mechanism becomes available, execute the blocked authenticated scenarios in strict AJM order.
3. Re-run Production verification and capture evidence before closing each applicable stage.
4. Only then execute Final Production Closure.
