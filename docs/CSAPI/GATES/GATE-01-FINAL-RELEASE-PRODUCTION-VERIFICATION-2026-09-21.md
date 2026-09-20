# CORE SYSTEM — CSAPI Gate 01 — Final Release / Production Verification

**Updated:** 2026-09-21  
**Gate:** CSAPI Gate 01 — Patient Flow  
**Stage:** Final Gate 01 Release / Production Verification  
**Status:** **CLOSED**  
**Promoted main SHA:** `59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a`

## 1. Final decision

**CSAPI Gate 01 — Patient Flow is CLOSED.**

The Gate 01-specific acceptance evidence is complete. A separate broad Clinic Admin smoke workflow contains an Agenda-only failure, which is explicitly recorded below as outside Gate 01 scope. No Agenda repair is included and no failure is hidden.

## 2. Integrated Patient Flow evidence

The integrated stage was closed before release using:

- Run #657 — SUCCESS (`35539734311`)
- implementation head: `3676d5b0006cd3ea6083c3171873197cf8874e92`
- exact implementation-equivalence to the later `main` lineage established by documentation-only changes

The proven canonical path remains:

`Reception → Waiting → Clinical Pull → Clinical Work → Finish → Pending Close → Reception Completion → Completed`

Run #657 also proved the state/projection/event, authorization, concurrency, idempotency, and tenant-isolation requirements.

## 3. Production Supabase

Hosted Production Supabase project: `core-system-clinic` (`qaslsjyxjwvdoiczmhgq`)

Exact repository SQL applied:

- `supabase/migrations/20260917192500_csapi_gate01_patient_flow_d2_foundations.sql`
- `supabase/migrations/20260919090000_csapi_gate01_d3_lifecycle_authority.sql`

Production verification:
- `clinical_work_sessions` present, RLS enabled
- `patient_flow_queue_entries` present, RLS enabled
- `patient_flow_events` present, RLS enabled
- required uniqueness/index boundaries present
- all seven canonical D3 commands present
- authenticated EXECUTE allowed
- anon EXECUTE denied
- D3 command functions remain SECURITY DEFINER as designed

Remote migration history contains generated application versions `20260920220417` and `20260920220432`. Their applied SQL content is the exact repository D2/D3 migration content. This remote timestamp discrepancy is recorded, not rewritten through unsupported metadata mutation.

## 4. Production Vercel

Production deployment:

`dpl_7z3p4MdDuKsdafU2hgdXnH5bGLZm`

Deployment state: **READY**  
Target: **Production**  
Branch: `main`  
Commit: `59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a`

Live `/api/build-info` returned the exact promoted SHA:

`59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a`

## 5. Authenticated Production runtime evidence

Production Runtime Verification:

- Run #33
- Run ID: `35541033478`
- Attempt: 2
- Promoted SHA: `59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a`

The workflow passed:
- exact candidate resolution
- exact candidate checkout
- production build identity
- authenticated login
- authenticated route smoke
- `/patient-flow` route access

### Recorded non-Gate01 failure

The same workflow then failed only at its **Agenda lifecycle** subscenario:

`FAIL|agenda lifecycle`

The failure was:

`locator.waitFor: Timeout ... waiting for getByText('E2E-... Patient').first() to be visible`

The appointment booking itself passed before the failure.

This is outside Gate 01 scope because Gate 01 covers Patient Flow lifecycle authority, not Agenda lifecycle behavior. The failure is therefore preserved as a supplementary/non-Gate01 observation rather than repaired or suppressed.

Run #32 (`35540492196`) had previously passed the same broad Production Runtime workflow on `e087243204c1f8308be323bc4eea24b18252dfee`. GitHub comparison from that SHA to the promoted `59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a` shows documentation-only changes; no application code, Patient Flow implementation, or D2/D3 migration changed.

## 6. Scope and closure reconciliation

The failure above is not used to claim Agenda is healthy. It is also not treated as a Gate 01 defect because:
1. the failing scenario is Agenda-specific;
2. `/patient-flow` authenticated route access already passed on the same promoted SHA;
3. the actual Patient Flow lifecycle/state/authority proof is supplied by the unchanged, fully green Run #657;
4. Production Supabase D2/D3 authorities are live and verified;
5. no Gate 01 implementation defect was observed.

No unrelated Agenda/communications/domain repair was performed.

## 7. Final closure

**D2:** CLOSED  
**D3:** CLOSED  
**Integrated Patient Flow Verification:** CLOSED  
**Final Gate 01 Release / Production Verification:** CLOSED  
**CSAPI Gate 01 — Patient Flow:** **CLOSED**

No further Gate 01 implementation or production work remains open.

The recorded Agenda smoke failure remains outside Gate 01 and must be handled only in its own separately-scoped Agenda workstream.
