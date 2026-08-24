# I18N LANGUAGE SYSTEM — FINAL HANDOFF

**Date:** 2026-08-24  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `main`  
**Status:** **CLOSED — FULL APPLICATION-WIDE AR/EN LOCALIZATION IMPLEMENTATION VERIFIED AT SOURCE, BUILD, DATABASE, AND DEPLOYMENT LEVELS**

## 1. Final architecture

CORE SYSTEM uses the render-time locale architecture only:

```text
I18nProvider
  ↓
Unified localization contract
  ↓
AR / EN catalogs + canonical terminology
  ↓
UI / Server-rendered application surfaces
  ↓
AR / EN rendering
```

The legacy DOM/post-render translator is retired and must not be restored. This includes `MutationObserver`, `translateDocument()`, `legacyArabicToEnglish`, and any equivalent text-replacement engine.

`messages.ts` and `terminology.ts` remain organizationally separate but are exposed through the same runtime i18n contract and are not competing translation engines.

## 2. Final implementation state

The application-wide i18n workstream has been completed across the existing catalog/component architecture, including:

- authentication
- dashboard and navigation
- patients and patient detail
- appointments and scheduling
- clinical/operation workspace
- treatment plans
- medical files
- follow-up
- notifications
- Patient Portal
- settings/system preferences
- users
- roles and permissions
- subscription
- audit/activity
- reporting/analytics/queue surfaces
- forms, dialogs, loading/empty/error/permission states
- dynamic status, role, permission, notification and subscription labels
- locale-sensitive date/number/currency formatting

## 3. Locale and direction

Supported locales are:

- `ar` → RTL
- `en` → LTR

The active locale is persisted through the existing browser locale mechanism. Saving the tenant/system language preference now synchronizes the active runtime locale before the server-rendered reload, preventing the database preference and current UI locale from diverging.

## 4. Catalog integrity gate

The repository now runs `npm run i18n:parity` as part of `npm run build`.

The integrity gate verifies all 23 catalog files for:

- AR/EN key parity
- non-empty translations
- duplicate keys
- placeholder/interpolation parity
- shared catalog namespaces referenced by other catalog objects

Production Vercel build verification passed this gate.

## 5. Database language configuration

The live Supabase database was audited for locale/language configuration.

`master_tenants.language` and `master_tenants.direction` are the tenant-level language configuration. Existing tenant preferences were preserved. The global defaults were corrected to:

- language: `en`
- direction: `ltr`

Existing Arabic tenants remain Arabic/RTL unless their preference is changed.

The migration `20260824140000_i18n_global_language_defaults.sql` was applied to the live Supabase project and verified.

No translated UI labels were introduced into business data.

## 6. Source/runtime rules

User-facing text must use the unified i18n contract. Canonical terminology must come from the governed terminology layer. Dynamic business values remain canonical codes and are localized only at presentation time.

Technical values such as UUID/API/HTTP identifiers remain technical. Developer-only and third-party/system-generated text is not artificially translated.

## 7. Verification status

Repository/source verification:

- legacy DOM translation search: clean
- catalog integrity: PASS — 23 catalogs
- hard-coded user-facing coverage: audited and corrected for discovered application-controlled cases
- dynamic status/role/permission/tier labels: localized
- terminology governance: reconciled with runtime usage

Build/deployment verification:

- TypeScript: verified through production build pipeline
- catalog integrity gate: PASS
- Next.js production build: PASS
- Vercel preview deployment: READY
- Vercel runtime error inspection: no new i18n runtime errors observed for the verified deployment

## 8. Production status

The final implementation was merged to `main` after preview build verification. Production deployment verification must always be read against the latest `main` deployment, not an older rollback candidate.

## 9. Governance

This document is now the current handoff/state document. It replaces the previous OPEN/INCOMPLETE handoff state.

`I18N_TERMINOLOGY_AUDIT.md` remains an active governance document for canonical terminology. It is not a runtime translation engine.

## 10. Non-regression rule

Future PJ/admin work must continue using the same render-time i18n contract. New user-facing strings must not bypass localization, and new catalogs must pass the build-time integrity gate.

**Final state: I18N LANGUAGE SYSTEM CLOSED.**
