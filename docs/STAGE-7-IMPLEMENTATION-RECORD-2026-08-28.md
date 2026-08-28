# Stage 7 — Patient Context

Date: 2026-08-28
Status: **PRODUCTION CANDIDATE — FINAL RUNTIME VERIFICATION PENDING**
Production Ready: **PENDING VERCEL RUNTIME VERIFICATION**

## Authority and scope

Stage 7 was derived from the repository's Global UX/IA execution authority, especially `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md` and `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`. The Stage 7 scope is the patient-context/contextual-navigation work: make the existing patient context the operational anchor for authorized related work without creating a parallel patient journey, authorization, entitlement, or domain registry.

## Definition of Done used

- Patient context is available from the canonical Patient Detail surface.
- Existing AJM/PJ-owned surfaces are reused rather than duplicated.
- Contextual navigation preserves patient identity into Agenda, Treatment Plans, Invoices, and Follow-up.
- Existing Patient Portal action is surfaced from patient context.
- UI visibility is permission-derived.
- Existing server-side domain authorization remains authoritative.
- Arabic/English parity and RTL/LTR behavior remain governed by the canonical i18n system.
- No Stage 7 database migration or parallel authorization/domain architecture is introduced.
- Stage 5 and Stage 6 audits remain green.
- GitHub TypeScript, i18n, Stage 5, Stage 6, Stage 7, changed-surface ESLint, and production build gates pass.
- Production candidate handoff path is defined and uses the canonical Vercel project/team identifiers.
- Vercel production deployment and runtime verification are required for final closure.

## Implementation

- Added `src/features/patient-context/PatientContextPanel.tsx` as a presentation/orchestration surface only.
- Integrated Patient Context into `src/features/patients/patient-detail.tsx`.
- Added patient-scoped Agenda context handling to `src/app/(dashboard)/agenda/page.tsx`.
- Added patient-scoped Invoice loading to `src/app/(dashboard)/invoices/page.tsx`.
- Reused existing Treatment Plan, Invoicing, Follow-up, Agenda, Patient History, and Patient Portal capabilities.
- Added `tools/patient-context-stage7-audit.mjs`.
- Extended `.github/workflows/ux-stages-0-4-ci.yml` to the Stage 7 gate and wired the production candidate workflow to the new gate name.
- Corrected the Patient Context Portal label to use the canonical Patient Portal i18n namespace.
- Corrected the production handoff workflow to target the actual Vercel project and team identifiers.

## Architecture reconciliation

No new domain owner, patient registry, queue, journey engine, authorization engine, entitlement engine, or database model was created. Patient Detail remains the canonical patient context surface. Agenda, Treatment Plans, Invoices, Follow-up, Medical Files, Patient Portal, AJM and PJ retain their existing ownership.

## Database / Supabase

No migration was added for Stage 7. Production schema inspection confirmed the required authorization vocabulary exists for the contextual surfaces, and tenant/RLS ownership remains in the existing domain architecture. No production schema drift was introduced by Stage 7.

## GitHub validation evidence

- Final Stage 7 CI candidate: `UX Stages 0-7 CI`, run #80, commit `7d12477e0844bb0087fcd4a8f2f9b70c83b14f1a`, successful.
- Run #80 passed lockfile synchronization, dependency installation, TypeScript, I18N audit/parity, Stage 5 Widget Catalog audit, Stage 5 Domain Surface audit, Stage 6 Patient Flow audit, Stage 7 Patient Context audit, changed-surface ESLint, and production build.
- Full-repository ESLint remains a diagnostic gate and reports pre-existing findings outside the Stage 7 changed surface.
- Production dependency audit remains a diagnostic finding because the current dependency graph contains high-severity transitive advisories, including a Next.js advisory for the currently pinned version; no forced dependency upgrade was made without a compatibility validation cycle.

## Vercel verification

The canonical Vercel project is `core-system-clinic` with project ID `prj_DN3UgHVBUHrFG6i6ycxAWj0bXLbG` and team ID `team_VlSz1DTffYBwmUEcYQtR8JiN`.

The previous failed production deployment `dpl_giREeTD4XP5uueRMvQqbbNJ8uqSt` was for commit `aa7edcc308a1f89e6715ee2f5c0c82f226044087` and failed during type checking because Patient Context referenced a non-existent `messages.patientPortal` namespace. That code defect has since been corrected; the current Patient Context uses the canonical Portal namespace and GitHub production build passes.

The exposed Vercel deployment action currently rejects the deployment arguments required by its backend schema, so deployment is being handled through the repository's canonical Vercel Git/production handoff path rather than by bypassing the validated GitHub gate.

## Final state

Engineering implementation: **PASS**.
GitHub Stage 7 validation: **PASS**.
Production build: **PASS**.
Production candidate: **PASS**.
Vercel production deployment for the final validated candidate: **PENDING**.
Runtime/UX production verification: **PENDING**.
Stage 7 closure: **PENDING FINAL VERCEL RUNTIME VERIFICATION**.
