# CORE SYSTEM — CSAPI Gate 01 — D3 Verification Plan

**Updated:** 2026-09-19
**Status:** IN PROGRESS — STEP 4 RUNTIME PENDING
**Stage:** D3 — Lifecycle Write Authority / Commands

## 1. Test architecture decision

D3 will not reuse D2 proof as a substitute for lifecycle proof.

Verification is split into four layers:

1. **Engineering** — typecheck, lint, build.
2. **D3 database/command lane** — disposable local database, migration replay, command-level SQL/pgTAP checks.
3. **Existing Patient Flow regression** — Stage 6 static audit remains active.
4. **Integrated D3 runtime** — controlled local production server and a dedicated Patient Flow scenario.

Vercel and hosted Production Supabase are outside these tests.

## 2. D3 database/command evidence

The D3 database lane must prove both positive and negative paths.

Positive:
- each legal command succeeds;
- expected Visit status is produced;
- expected Queue Entry state is produced;
- expected Work Session state is produced;
- expected Event is produced.

Negative:
- invalid transitions fail;
- wrong context/permission fails;
- cross-tenant IDs fail;
- duplicate active state fails;
- competing concurrent clinical starts cannot both succeed.

## 3. Concurrency proof

At least one verification must create two competing starts against the same waiting Visit and demonstrate that only one transaction succeeds and only one active Work Session exists afterward.

This is required because the existing application actions use compare-and-update semantics, while D3 introduces multi-table projection requirements.

## 4. Idempotency proof

For commands with a `correlation_id`, repeat the same logical command and demonstrate that the retry does not create duplicate Work Sessions, Queue Entries or Events.

Where a command intentionally is not retry-idempotent, its error contract must be explicit and tested.

## 5. Regression proof

The existing `tools/patient-flow-stage6-audit.mjs` remains required as a regression check.

The existing D2 test remains a historical/D2 integrity check and is not converted into a D3 lifecycle test.

## 6. Runtime proof

Runtime must follow the actual approved business path:

```
Reception → Waiting → Reorder (when applicable)
→ Clinical Pull/Start
→ Clinical Work
→ Finish
→ Pending Close
→ Reception Complete
→ Completed
```

At least one negative runtime case must verify that a clinical user cannot complete the reception-owned final transition without the required authority.

## 7. Verification reporting

Every D3 step must leave an evidence record:
- Step ID;
- exact head SHA;
- files changed;
- command/test executed;
- PASS/FAIL;
- first blocker if failed;
- corrective change;
- re-verification result;
- next step.

No step may be marked complete from source inspection alone.

**Status:** PRE-IMPLEMENTATION VERIFICATION PLAN.


## Current D3 Verification State

**2026-09-19 — Step 3 PASS**

Exact verified head: `c57e35b791593175343c893d57368c582129fa24`

Run #548 (`35441891645`) passed Engineering, D3 database/command, Patient Flow Stage 6 regression and Final gate.

Step 3 server-action integration is complete. The remaining required evidence is the dedicated integrated runtime suite.
