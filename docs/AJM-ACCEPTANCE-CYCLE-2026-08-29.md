# CORE SYSTEM — AJM Acceptance Cycle 2026-08-29

**Authority:** `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`
**Production branch:** `main`
**Acceptance rule:** Historical CLOSED labels are evidence only. AJM-0 through AJM-8 are UNEXECUTED for this acceptance cycle until the current state machine is satisfied.

## Current execution state

| Stage | Acceptance-cycle state | Evidence basis |
|---|---|---|
| AJM-0 | PRECHECK / RECONCILED | Current main, AJM/UX/PJ docs, live Supabase, Vercel runtime inspected |
| AJM-1 | UNEXECUTED | Historical implementation exists; current acceptance pending |
| AJM-2 | UNEXECUTED | Historical implementation exists; current acceptance pending |
| AJM-3 | UNEXECUTED | No complete Workforce implementation evidenced on current main |
| AJM-4 | UNEXECUTED | Communications foundation exists; full current acceptance pending |
| AJM-5 | UNEXECUTED | No complete general coordination model evidenced on current main |
| AJM-6 | UNEXECUTED | Existing Analytics/Reports foundation; current acceptance pending |
| AJM-7 | UNEXECUTED | Current cross-domain production acceptance not yet demonstrated |
| AJM-8 | UNEXECUTED | Final closure cannot precede AJM-0..7 acceptance |

## AJM-0 pre-stage evidence

### Repository
- `main` is the authoritative branch.
- The AJM full execution prompt was promoted into `main` by merge commit `bcd86880d4f71e29ea20739e8e585eb229a5e9ec`.
- Required AJM execution handoff, unified AJM/UX plan, terminology governance and reconciliation artifacts are now present on `main`.
- Existing AJM/PJ/UX implementation is retained and treated as evidence to inspect, not as acceptance.

### UX / IA
- Current navigation registry exposes canonical Patient Flow, Financial & Resources, Treatment Plans, Follow-up and contextual Operations/Clinical/Queue surfaces.
- Workspace remains a presentation surface; permission resolution remains separate from navigation visibility.
- Existing UX reconciliation documents identify historical Patient Flow, Workspace and Global Search findings; these remain evidence and must be checked against current runtime before closure of affected stages.

### PJ
- PJ remains the patient-centered journey authority.
- Existing Visit, Treatment Plan, Follow-up, Queue, Medical Photos and Patient Portal implementations are treated as reusable integration anchors, not duplicated by AJM.

### Supabase
- Live project: `qaslsjyxjwvdoiczmhgq`.
- Live schema and RLS were inspected.
- Security advisor currently reports public-schema extension warnings and executable SECURITY DEFINER functions; these are recorded for stage-specific security reconciliation rather than silently ignored.
- Live financial/AJM foundations exist and must be reconciled with the current AJM-2 contract.

### Runtime
- Production `/login` currently returns HTTP 200 with rendered authentication UI and Arabic/English language controls.
- Authenticated production verification is not currently executable from the available tool environment because no approved test identity/session is exposed.
- Actionable blocker: GitHub Issue #53 — authenticated production E2E test identity/access.

## Acceptance blocker

Issue #53 is a genuine external verification dependency for authenticated runtime acceptance. It does **not** justify stopping implementation work that can be safely completed without authenticated runtime evidence. Affected stages must not be marked CLOSED until the authenticated evidence is available.

## Rule for continuation

Continue in strict order using:

`Inspect → Reuse → Extend → Create only when genuinely required`

For every stage, record AJM → PJ → UX/IA → authorization/entitlement → canonical data owner → runtime → evidence → production verification → closure.
