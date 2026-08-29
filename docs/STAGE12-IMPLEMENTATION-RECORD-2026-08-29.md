# CORE SYSTEM — Stage 12 Implementation Record

Date: 2026-08-29
Branch: `stage12-security-permission-regression`
Base: `main`

## Source of truth

The repository was inspected before implementation. The requested Stage 12 scope is defined by the current execution mandate because no dedicated Stage 12 specification document was present in the repository. The Global UX/IA master documents were read and used as governing architecture/UX references.

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

- all public tables inspected have RLS enabled;
- representative tenant-scoped runtime reads were evaluated under the `authenticated` role;
- a user in one tenant saw only that tenant's patient rows;
- a cross-tenant patient update returned zero rows and was rolled back;
- permission evaluation for a doctor returned `users:create = false` and `sessions:read = true`;
- security-definer authorization helpers use `search_path=public`;
- anonymous execution of the inspected authorization helpers is denied.

## CI evidence

The Stage 12 workflow must finish successfully before closure. The gate includes npm dependency installation/security audit, TypeScript, changed-surface ESLint, Stage 12 security audit, i18n, prior UX audits and production build.

## Vercel

Vercel preview deployments for this branch are subject to the observed build-rate-limit status. No manual deployment was triggered. This is not used as a CI substitute.

## Closure rule

This record is not itself a closure declaration. Stage 12 may be marked CLOSED only after CI PASS, final security evidence, Production Candidate freeze, one merge to `main`, production deployment with matching SHA, and runtime verification.
