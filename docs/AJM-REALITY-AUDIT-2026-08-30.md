# CORE SYSTEM — AJM Full Clinic Operational Reality Audit

Date: 2026-08-30

## Current decision

**NOT CLOSED — BLOCKER**

The audit is not eligible for Production Closure because the repaired commit has not yet reached a verified Production deployment. The current Production deployment remains `fa20bf7`, while the repaired repository state is newer (`66967c5` at the audit checkpoint; subsequent documentation-only migration reconciliation commits followed).

## Evidence-driven findings

### 1. Production E2E failure reproduced against the actual current Production deployment

The authenticated Production gate completed its static/build/AJM/UX checks successfully, then executed the real-world Clinic Admin scenario against `https://core-system-clinic.vercel.app`.

Observed failures:

- Patient creation — patient not visible after registration.
- Appointment booking — patient not found.
- Agenda reschedule lifecycle — patient not found.
- Arabic parity — RTL direction missing.

The downstream appointment failures are dependent failures from the missing patient in the same scenario.

### 2. Root cause identified in Repository + Database

The patient registration form permits optional gender and exposes `other`, `phone`, and `archived` values. The live `clinic_patients` constraints previously rejected these representations. The server action also serialized empty optional fields instead of omitting them, and the client patient query was not invalidated after a successful mutation.

The repair therefore:

- normalizes empty optional patient fields;
- reconciles patient constraints with the values exposed by the canonical patient form;
- invalidates patient queries after successful create/update;
- prioritizes the explicit locale cookie over stale localStorage during locale initialization.

### 3. Live database reconciliation

The corrected patient constraints were applied through a Supabase migration named:

`ajm_reality_audit_patient_constraint_reconciliation_20260830`

The repository migration filename was subsequently reconciled to the live migration version `20260830015623` and the duplicate timestamped migration file was removed.

### 4. Static and architecture validation

On the repaired candidate, the production-gate job passed:

- production build;
- lint (warnings only, zero errors);
- AJM integrated static audit;
- AJM migration sequence audit;
- i18n source/catalog audits;
- UX widget/domain surface audits;
- Patient Flow Stage 6 audit;
- Patient Context Stage 7 audit;
- Global Search Stage 8 audit;
- mobile Stage 11 audit;
- security/permission Stage 12 audit;
- legacy Stage 14 audit;
- documentation Stage 15 audit.

These are static/structural gates and are not treated as runtime closure evidence.

## Production deployment blocker

Vercel's current project state reports `live: false`. The latest deployment is an ERROR preview deployment from the repair branch, while the latest READY Production deployment remains the pre-repair `fa20bf7` deployment. The Production handoff was skipped because the authenticated Production E2E gate failed against that still-active Production deployment.

Therefore the repair has **not** been accepted as Production-verified.

## Required next closure sequence

1. Obtain a validated deployment of the repaired main commit through the governed Vercel production handoff.
2. Re-run authenticated Production E2E against that repaired deployment.
3. Re-run the full Clinic Admin real-world scenario and verify patient persistence, booking, reschedule, and Arabic RTL.
4. Verify the resulting records directly in Supabase.
5. Execute the required role-specific scenarios for Clinic Admin, Receptionist, Doctor, Accountant, and Skin Specialist.
6. Complete Production verification and only then evaluate AJM-0 → AJM-8 for final closure.

No `CLOSED` or `PRODUCTION CLOSED` claim is made by this document.
