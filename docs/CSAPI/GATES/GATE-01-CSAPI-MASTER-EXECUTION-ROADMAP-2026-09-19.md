# CORE SYSTEM — CSAPI Gate 01 Master Execution Roadmap

Updated: 2026-09-21
Current position: Gate 01 CLOSED after Integrated Patient Flow Verification and Final Gate 01 Release / Production Verification.
Production application candidate SHA: 59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a
D3 merge SHA: c504897e01a1429e7729e27960e2f33cdb1b8f21
Next CSAPI gate: Gate 02 — Patient Journey — OPEN / PRECHECK READY

## 1. Sequence

D1 — application / contract foundation
        ↓
D2 — database foundations [CLOSED]
        ↓
D3 — lifecycle write authority / commands [CLOSED]
        ↓
Integrated Patient Flow verification [CLOSED]
        ↓
Final Gate 01 release / production verification [CLOSED]
        ↓
Gate 01 CLOSED
        ↓
Gate 02 — Patient Journey [OPEN / PRECHECK READY]

## 2. D1

D1 was the application-side foundation for the Patient Flow API path. It remains a prerequisite history and must not be rebuilt inside D2, D3 or Gate 02.

## 3. D2 — CLOSED

D2 introduced the Patient Flow database foundations and was merged to main as 6013a9ffa4705738bc9e8de7c0d1403ff6a0858e.

## 4. D3 — CLOSED

D3 established the canonical Patient Flow lifecycle write authority over D2.

Required semantics remain:
- Reception opens the operational Visit workflow.
- Patient enters Waiting; Waiting is not clinical encounter start.
- Reception may reorder/move Waiting cases.
- Responsible clinical actor pulls the patient when work begins.
- Clinical completion uses the approved term Finish.
- Finish produces pending_close.
- Reception owns final completion to completed.

D3 canonical commands remain the lifecycle write authority.

## 5. Gate 01 final status

### Integrated Patient Flow Verification — CLOSED

Evidence:
- Run #657 (35539734311) fully green on implementation head 3676d5b0006cd3ea6083c3171873197cf8874e92.
- Current-main comparisons confirmed no application/runtime/migration/test implementation drift after that green candidate.

### Final Gate 01 Release / Production Verification — CLOSED

Final production evidence is recorded in:
docs/CSAPI/GATES/GATE-01-FINAL-RELEASE-PRODUCTION-VERIFICATION-2026-09-21.md

Final promoted application candidate:
59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a

The production deployment/build identity and hosted Supabase verification are recorded in the final release record.

### Gate 01 closure

CSAPI Gate 01 — Patient Flow is CLOSED.

No further implementation, migration, Vercel or Production Supabase work belongs to Gate 01. Any subsequent work starts as a new explicitly scoped CSAPI workstream and must not reopen Gate 01 implicitly.

## 6. Transition to Gate 02

Gate 02 is defined by the CSAPI plan as:

Patient Journey — Longitudinal patient lifecycle over time; next actions and continuity.

Gate 02 begins with PRECHECK, not implementation.

It must reconcile current PJ records with actual repository, Supabase and runtime behavior, especially:
- longitudinal patient identity/context;
- Treatment Plan → Next Action continuity;
- Next Action → Appointment / Follow-up / Operational Work mapping;
- completed Visit → continuation behavior;
- ownership boundaries among Patient/PJ, Patient Flow, Agenda, Treatment Plan, Follow-up, Coordination and Financial/Resource domains.

The Agenda-only production observation from Gate 01 remains an external domain observation and is assessed for dependency impact during Gate 02 precheck; it is not a Gate 01 reopening.

## 7. Hard boundaries

- No direct changes to main.
- No second Patient Flow engine.
- No second Queue or scheduling engine.
- No new permission engine.
- No unrelated domain repairs merely because they are encountered.
- No Vercel during routine precheck/validation.
- No Production Supabase mutation during routine precheck/validation.
- Material scope changes require explicit Product Owner decision.
