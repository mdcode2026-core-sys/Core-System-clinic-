# CORE SYSTEM — AI Engineering Current State

Status: CURRENT BASELINE — SYSTEM-WIDE ENGINEERING FOUNDATION CLOSED
Snapshot: 2026-09-25
Purpose: Conversation-independent entry baseline for the AI Engineering Organization

## 1. Project

Repository: mdcode2026-core-sys/Core-System-clinic-
Canonical implementation branch: main
Main SHA observed: f64b52dbaf8116281157dc9a1a95d5b0470be3c3

The repository is the permanent engineering knowledge base.

## 2. Current organizational bootstrap state

The AI Engineering Organization governance layer is merged into main through PR #204.

The governance model now includes the complete full-team responsibility map:

- AI Engineering Leader / CTO
- Product Manager / Business Analyst
- Principal / Solution Architect
- Backend Engineer
- Database / PostgreSQL / Supabase Engineer
- Frontend / Product Engineer
- QA / SDET
- Security Engineer
- DevOps / Platform / SRE
- Data / BI Engineer
- AI / ML Engineer
- Product Designer / UX
- Clinical / Healthcare Domain Advisor
- Technical Writer / Documentation Engineer

These are responsibility boundaries, not necessarily separate agents or subscriptions. The AI Engineering Leader activates and combines functions as required while preserving independent verification and security boundaries.

This branch remains governance-only.

It does not authorize application, database, production or CSAPI feature changes.

## 3. Current GitHub execution reality

Main currently contains the merged Gate 03 implementation sequence through PR #200.

Current CSAPI GitHub state:
- PR #201 — Gate 01/02 deep evidence reconciliation: CLOSED as superseded.
- PR #203 — Gate 01/02 comprehensive repair and longitudinal continuity: OPEN, unmerged, current CSAPI work package under reconciliation; it remains part of the active CSAPI workstream.
- PR #204 — AI Engineering Organization + system-wide engineering foundation: CLOSED / MERGED; merge commit `f64b52dbaf8116281157dc9a1a95d5b0470be3c3`.

PR #203 remains downstream of the system-wide foundation and must not be treated as completed or merged.
PR #204 is closed and is not a CSAPI feature package.

Historical branch references exist in large numbers. Their names alone are not evidence that work is active or valid.

## 3.1 System-wide engineering foundation

The governance bootstrap is not the end of the organizational work.

The completed system-wide work package was the **System-Wide Domain Ownership & Canonical Source Reconciliation** defined in:

`docs/AI-ENGINEERING/SYSTEM-WIDE-DOMAIN-OWNERSHIP-AND-CANONICAL-SOURCE-RECONCILIATION-2026-09-25.md`

Its purpose is to complete and validate the AI Engineering operating model against the real CORE SYSTEM as a whole — not to establish a CSAPI-specific operating model and not to treat CSAPI as the scope of the foundation.

Required closure chain:

Architecture → Ownership → Canonical Source → Execution Path → Repository → DB/Migrations → Authorization → Runtime → Verification → Documentation.

The system-wide foundation is now CLOSED. Evidence covered Gate 01 implementation-path audit, Gate 02 longitudinal integrity audit, expanded duplicate-engine/ownership tracing, repository↔Live migration lineage reconciliation, authorization-boundary classification, representative runtime authority verification, final ownership/canonical-source reconciliation, and independent GitHub Actions verification.

CSAPI remains the active project workstream. It is the next execution destination after the system-wide engineering foundation is closed; it is not the scope or owner of this foundation.

## 4. Current CSAPI authority state

CSAPI remains the active project workstream. The system-wide engineering foundation is a control/setup phase for how CSAPI and subsequent work are executed; it does not change CSAPI's project status.

- Gate 01 — Patient Flow: CLOSED.
- Gate 02 — Patient Journey: CLOSED / VERIFIED / PRODUCTION VERIFIED.
- Gate 03 — Patient & Identity: current CSAPI Gate context. Its repository/live/verification state remains subject to the CSAPI reconciliation evidence and is not to be silently reclassified by the engineering foundation.
- PR #203 remains open and is part of the active CSAPI workstream; its open state is not evidence of completion or mergeability.
- Older global documents that still say Gate 02 is OPEN are stale documentation and must be reconciled; they do not override the dedicated Gate 02 closure record, CSAPI master state, gate plan, and current handoff.

The AI Engineering Leader must therefore keep implementation controlled while the system-wide foundation establishes the canonical execution baseline. This is an execution hold/control, not a change of CSAPI status.

## 5. Current database/runtime baseline

Supabase project: core-system-clinic
Project ref: qaslsjyxjwvdoiczmhgq
Region: eu-central-1
PostgreSQL: 17.6
Project status observed: ACTIVE_HEALTHY

Live evidence refreshed: 2026-09-25. Observed public schema: 126 tables; 277 public functions; 131 triggers; 278 RLS policies; 5 tenants; 396 patients; 139 visit sessions; 342 agenda events; 825 follow-ups; 17 operational work items.

The database has known advisor findings. These are baseline findings, not automatically authorized repair scope.

## 6. Immediate governance rule

The current engineering action is:

The system-wide engineering organization and ownership reconciliation is CLOSED. The next implementation step resumes in CSAPI from its reconciled canonical continuation point.

Completed closure evidence includes material migration-lineage classification, authorization-boundary classification, representative runtime authority verification, duplicate-engine reconciliation, final ownership/canonical-source register, and independent GitHub Actions verification. Controlled downstream findings remain registered as future implementation work packages and were not silently patched in the foundation.

This foundation does not reopen or advance CSAPI gates by itself. Once the system-wide foundation is closed, execution resumes in CSAPI from its reconciled canonical continuation point.

## 7. Governance review state

PR #204 was the single governance integration PR. It contained documentation-only changes and no application or database changes. It is now CLOSED / MERGED. No application, Supabase schema/data, or Vercel production mutation was part of this foundation.

## 8. Continuation

After governance integration, the AI Engineering Leader resumes the active CSAPI work against `main`, open PRs, CI, Live database and current CSAPI authority and establishes exactly one canonical CSAPI continuation point. Gate 01 and Gate 02 remain closed; Gate 03 remains the current CSAPI context.

### New-conversation entry key
**CSAPI** is the explicit conversation-start key for the active project workstream. When a new conversation begins with `CSAPI`, first load this current state together with the current CSAPI master state, gate plan, handoff/ledger, open CSAPI PR state, and Live/repository evidence. Do not reopen Gate 01 or Gate 02. Begin by reconciling the current Gate 03 continuation point before implementation.


### Latest system-wide evidence

The foundation has now produced controlled work-package findings rather than only architectural observations:
- Patient/Identity authorization gaps in register/update functions;
- Agenda legacy mutation capability;
- repository↔Live migration semantic divergence;
- authenticated SECURITY DEFINER function classification;
- public-schema extension review.

These are registered in the system-wide reconciliation document and are not being patched opportunistically.
