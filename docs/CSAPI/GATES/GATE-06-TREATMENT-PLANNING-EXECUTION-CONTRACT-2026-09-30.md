# CSAPI Gate 06 — Treatment Planning — Execution Contract
## 2026-09-30

**Status:** Draft/frozen for planning transfer only

## Contract
Gate 06 implementation, when later authorized, must:
1. preserve `clinic_treatment_plans`, `clinic_treatment_plan_items`, `clinic_treatment_plan_visits` as canonical state;
2. use one canonical mutation path;
3. enforce tenant and effective-permission boundaries;
4. enforce explicit plan and stage transition matrices;
5. keep visit linkage distinct from stage completion;
6. emit explicit next-action intent without executing downstream domains;
7. keep Agenda as sole appointment authority;
8. keep Coordination as sole operational-work authority;
9. keep Clinical as source of clinical decisions/recommendations;
10. preserve Follow-up as Gate 11 authority;
11. preserve package/financial ownership outside Gate 06;
12. preserve existing data through additive/non-breaking migration;
13. maintain idempotent next-action generation;
14. provide audit/provenance for lifecycle mutations and overrides;
15. verify clean replay, structural, authorization, tenant-isolation, runtime and authenticated E2E evidence before closure.

### Required evidence lanes
- repository/build/type/lint;
- clean database migration replay;
- lifecycle transition verification;
- tenant isolation/RLS;
- authorization and direct-write denial;
- next-action idempotency;
- local production runtime;
- authenticated E2E;
- cross-domain Agenda handoff;
- Gate 02 regression;
- final production verification after exact main SHA.

### Forbidden before authorization
- application code changes for Gate 06;
- migration creation/application;
- Live Supabase mutation;
- Vercel production release;
- weakening/removing required tests;
- changing Gate 04/05 ownership to unblock Gate 06.

This contract becomes implementation authority only after the two-gate barrier is removed by verified closure.
