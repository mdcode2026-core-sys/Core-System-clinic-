# CORE SYSTEM — CSAPI Gate 01 — Final Release / Production Verification

**Updated:** 2026-09-21
**Stage:** Final Gate 01 Release / Production Verification
**Status:** PASS — CLOSED
**Gate:** CSAPI Gate 01 — Patient Flow
**Promoted main SHA:** `e087243204c1f8308be323bc4eea24b18252dfee`
**Binding contract:** `docs/testing/workstream-contracts/csapi-gate01-final-release.execution.json`

## 1. Release decision

The final Gate 01 release/production verification criteria are satisfied from repository, hosted Supabase, Vercel, and GitHub Actions evidence.

**Decision: CSAPI Gate 01 — Patient Flow CLOSED.**

## 2. Supabase Production rollout

Project: `core-system-clinic` / `qaslsjyxjwvdoiczmhgq`

The exact repository SQL content from:
- `supabase/migrations/20260917192500_csapi_gate01_patient_flow_d2_foundations.sql`
- `supabase/migrations/20260919090000_csapi_gate01_d3_lifecycle_authority.sql`

was applied to hosted Production Supabase using the supported migration application boundary.

Remote migration history records:
- `20260920220417` — `csapi_gate01_patient_flow_d2_foundations`
- `20260920220432` — `csapi_gate01_d3_lifecycle_authority`

These generated remote versions are explicitly reconciled to the repository source migration files above. No unsupported direct manipulation of migration metadata was used.

Post-rollout verification:
- `clinical_work_sessions`: present, RLS enabled.
- `patient_flow_queue_entries`: present, RLS enabled.
- `patient_flow_events`: present, RLS enabled.
- D2 active-record uniqueness/index boundaries are present.
- all seven canonical D3 command functions exist;
- `authenticated` can execute the canonical D3 commands;
- `anon` cannot execute them;
- the D3 functions remain SECURITY DEFINER as designed by the canonical command boundary.

The broad Supabase advisor output still contains pre-existing findings across unrelated domains. The D3 SECURITY DEFINER warnings are expected for these authenticated canonical command functions and are not treated as a Gate 01 defect. No unrelated domain repair was introduced.

## 3. Vercel Production

Production deployment:
- deployment: `dpl_Cw1AutDTYQfahkTKMAP8FhGSSVdU`
- target: Production
- state: READY
- branch: `main`
- deployed commit: `e087243204c1f8308be323bc4eea24b18252dfee`

Live `/api/build-info` returned:
```
{"commitSha":"e087243204c1f8308be323bc4eea24b18252dfee","branch":"main","environment":"production","verification":"production-candidate"}
```

Therefore the promoted Production deployment exposes the exact approved main SHA.

## 4. Production authenticated runtime

GitHub Actions:
- Workflow: **CORE SYSTEM Production Runtime Verification**
- Run #32
- Run ID: `35540492196`
- Candidate SHA: `e087243204c1f8308be323bc4eea24b18252dfee`
- Conclusion: **SUCCESS**

All workflow steps passed, including:
- exact candidate resolution/checkout;
- Production build identity check;
- dependency installation;
- Playwright installation;
- authenticated real-world Clinic Admin E2E;
- production evidence publication.

The real-world E2E explicitly exercises the authenticated `/patient-flow` route and the wider clinic runtime surfaces. The full canonical Patient Flow lifecycle semantics were already proven end-to-end by immutable Run #657 on the unchanged implementation lineage:
`Reception → Waiting → Clinical Pull → Clinical Work → Finish → Pending Close → Reception Completion → Completed`.

This combined evidence is the accepted Gate 01 release proof; no production service-role mutation was used to fabricate lifecycle behavior.

## 5. Production runtime observation

Vercel reported one AnalyticsEngine `communications.messages` error group during the verification window. Its first occurrence predates the Gate 01 release and it belongs to an unrelated analytics/communications path. It is recorded for transparency and intentionally excluded from Gate 01 scope; no unrelated repair is performed as part of this closure.

## 6. Final closure

Integrated Patient Flow Verification was previously closed with Run #657 plus exact implementation-equivalence evidence.

D3 Lifecycle Write Authority was previously closed and merged via PR #172.

D2 database foundations were previously closed and merged via PR #168.

The final release/production evidence above now closes the remaining Gate 01 stage.

**FINAL DECISION: CSAPI Gate 01 — Patient Flow — CLOSED.**

No further Gate 01 implementation, migration, runtime, or production work remains open. Subsequent CSAPI work must start as a new scope and must not reopen Gate 01 without a new explicit architectural/change-control decision.
