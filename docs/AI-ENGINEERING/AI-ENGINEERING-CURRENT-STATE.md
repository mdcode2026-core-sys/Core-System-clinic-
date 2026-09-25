# CORE SYSTEM — AI Engineering Current State

Status: CURRENT BASELINE — SYSTEM-WIDE ENGINEERING FOUNDATION OPEN
Snapshot: 2026-09-25
Purpose: Conversation-independent entry baseline for the AI Engineering Organization

## 1. Project

Repository: mdcode2026-core-sys/Core-System-clinic-
Canonical implementation branch: main
Main SHA observed: babcb6f915e6549a72c31167986e2e974e3bc30f

The repository is the permanent engineering knowledge base.

## 2. Current organizational bootstrap state

The AI Engineering Organization governance layer is implemented on this branch and is under review in PR #204.

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
- PR #203 — Gate 01/02 comprehensive repair and longitudinal continuity: OPEN, unmerged, canonical CSAPI work package.
- PR #204 — AI Engineering Organization + system-wide engineering foundation: OPEN, unmerged, current system-wide engineering work package.

PR #203 remains downstream of the system-wide foundation and must not be treated as completed or merged.
PR #204 is the current system-wide engineering package and is not a CSAPI feature package.

Historical branch references exist in large numbers. Their names alone are not evidence that work is active or valid.

## 3.1 System-wide engineering foundation

The governance bootstrap is not the end of the organizational work.

The current active work package is the **System-Wide Domain Ownership & Canonical Source Reconciliation** defined in:

`docs/AI-ENGINEERING/SYSTEM-WIDE-DOMAIN-OWNERSHIP-AND-CANONICAL-SOURCE-RECONCILIATION-2026-09-25.md`

Its purpose is to complete the engineering organization against the real CORE SYSTEM rather than only define role descriptions.

Required closure chain:

Architecture → Ownership → Canonical Source → Execution Path → Repository → DB/Migrations → Authorization → Runtime → Verification → Documentation.

The initial baseline has identified the major domains and canonical sources, but closure is not yet claimed because repository-path, migration-lineage, authorization and runtime evidence still need to be completed across the material domains.

CSAPI is downstream of this work and is not the active system-wide entry point.

## 4. Current CSAPI authority problem

The repository contains documentation-state drift around Gate 02 and Gate 03.

Current main records require Gate 03 verification to be treated as unresolved because required E2E evidence is not fully passing.

The open PRs #201 and #203 themselves challenge earlier Gate 01/02 closure evidence.

Therefore the AI Engineering Leader must use evidence reconciliation rather than document labels alone before continuing CSAPI work.

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

Complete the system-wide engineering organization and ownership reconciliation before starting a new domain workstream.

Do not use this foundation work to reopen CSAPI or to advance a CSAPI gate prematurely.

## 7. Governance review state

PR #204 is the single governance integration PR. It contains documentation-only changes and no application or database changes. The role map correction is part of the same governance scope and does not create a new PR.

PR #204 must not be merged merely to prove the model; merge remains subject to the repository's current review/verification rules and deployment restrictions.

## 8. Continuation

After governance installation is accepted, the AI Engineering Leader will reconcile the active CSAPI work against main, open PRs, CI, live database and current CSAPI authority and will establish exactly one canonical CSAPI continuation point.
