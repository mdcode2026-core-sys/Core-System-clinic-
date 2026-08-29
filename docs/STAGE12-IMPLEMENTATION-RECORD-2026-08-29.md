# CORE SYSTEM — Stage 12 Implementation Record

Date: 2026-08-29

## Source of truth

The repository was inspected before implementation. No dedicated Stage 12 specification document existed; the execution mandate and Global UX/IA authority were reconciled with the implemented repository state.

## Scope

Security / Permission Regression:

- authentication/session boundary;
- effective permissions and server-side authorization;
- capability/entitlement enforcement;
- Workspace/Widget presentation versus security boundary;
- tenant isolation and RLS;
- direct invocation resistance;
- relevant i18n and prior-stage regression gates.

## Implementation

1. Hardened `useWorkspace.updateWidgetState` so a widget definition must exist and its required permission and module feature gate must pass before state can be inserted or mutated.
2. Marked `src/core/entitlements/entitlementEngine.ts` as a server boundary so entitlement/capability evaluation cannot accidentally become a client-side authorization primitive.
3. Added `tools/security-permission-stage12-audit.mjs` as a blocking invariant audit.
4. Added `ux:security-stage12` to `package.json`.
5. Added `.github/workflows/stage12-validation.yml` as a blocking Stage 12 gate.
6. Repaired the existing CI lockfile gate in `.github/workflows/stage11-validation.yml`: `npm ci` is now the lockfile/install verification instead of mutating the lockfile with `npm install --package-lock-only`.

No database migration and no authorization/domain architecture rewrite were introduced.

## Live Supabase verification

Against the configured production Supabase project:

- inspected public tables have RLS enabled;
- representative tenant-scoped runtime reads were evaluated under the `authenticated` role;
- a user in one tenant saw only that tenant's patient rows;
- a cross-tenant patient update returned zero rows and was rolled back;
- permission evaluation for a doctor returned `users:create = false` and `sessions:read = true`;
- inspected security-definer authorization helpers use `search_path=public`;
- anonymous execution of the inspected authorization helpers is denied.

## CI evidence

Stage 12 GitHub Actions Run `33246665276` completed successfully:

- Stage 12 Security + Permission Regression Gate — PASS
- TypeScript — PASS
- ESLint — PASS
- Security audit — PASS
- I18N audit — PASS
- I18N parity — PASS
- Stage 5–11 regression audits — PASS
- Production build — PASS

## Production / closure state

Stage 12 implementation and CI are PASS and were merged into `main` through the validated Candidate path. The final production-readiness gate remains the Vercel Production deployment matching the final main SHA and the subsequent runtime verification. This record does not declare Production Ready independently of that evidence.
