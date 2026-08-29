# Stage 13 — Runtime / End-to-End Validation

## Scope
Validate the existing CORE SYSTEM implementation at runtime across authentication, registration, administration, Agenda, appointments, patient flow, queue, clinical workflow, Patient Journey, treatment plans, medical files/photos, follow-up, Patient Portal, financial/subscription/entitlement flows, permissions, workspaces, navigation, tenant isolation, Arabic/English, RTL/LTR, and responsive surfaces.

## Reconciliation Rule
Inspect → Verify → Reconcile → Implement/Fix → Validate → Revalidate. Existing AJM/PJ canonical domains remain the owners; no duplicate journey, queue, visit lifecycle, agenda, authorization, entitlement, or workspace is introduced.

## Blocking Validation
- npm ci
- TypeScript
- ESLint
- I18N audit and parity
- Stage 12 security regression
- Stage 5–11 regression audits
- production build
- production runtime smoke gate
- Supabase tenant/RLS verification

## Known Production Constraint
Vercel deployment rate limiting is treated as a production-delivery condition only; it is not used as a development validation environment or reason to bypass GitHub Actions.

## Status
Open until the Stage 13 GitHub Actions gate passes and the final production runtime is verified against the final main SHA.
