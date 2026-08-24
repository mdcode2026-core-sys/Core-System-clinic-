# I18N LANGUAGE SYSTEM — FINAL HANDOFF

**Date:** 2026-08-24  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `main`  
**Status:** **IMPLEMENTATION COMPLETE — PRODUCTION PROMOTION / FINAL PRODUCTION RUNTIME VERIFICATION PENDING**

## Final architecture

CORE SYSTEM uses the render-time locale architecture only. The legacy DOM/post-render translator is retired and must not be restored, including `MutationObserver`, `translateDocument()`, `legacyArabicToEnglish`, and equivalent replacement engines.

`messages.ts` and `terminology.ts` remain organizationally separate but are exposed through the same runtime localization contract.

## Implementation completed

The application-wide source migration and localization hardening covered authentication, dashboard/navigation, patients, patient detail, appointments/scheduling, clinical/operation workspace, treatment plans, medical files, follow-up, notifications, Patient Portal, settings/system preferences, users, roles/permissions, subscription, audit/activity, reporting/analytics/queue surfaces, forms, dialogs, loading/empty/error/permission states, and dynamic status/role/permission/notification/subscription labels.

Locale behavior is `ar` → RTL and `en` → LTR. Saving system/tenant language now synchronizes the active runtime locale before reload.

## Catalog integrity

`npm run i18n:parity` is part of `npm run build` and verifies the current 23 catalogs for AR/EN key parity, non-empty values, duplicate keys, placeholder/interpolation parity, and shared catalog namespaces.

The final Vercel preview build passed this gate:

`I18N catalog integrity passed for 23 catalog files (AR/EN keys, non-empty values, duplicates, and placeholders).`

## Supabase

The live database was audited for locale/language configuration. `master_tenants.language` and `master_tenants.direction` are tenant-level configuration. Existing tenant preferences were preserved.

Migration `20260824140000_i18n_global_language_defaults.sql` was applied to the live Supabase project, establishing global defaults `language=en` and `direction=ltr`.

No translated UI labels were introduced into business data.

## Verification completed

- legacy DOM translation search: clean
- catalog integrity: PASS — 23 catalogs
- source/component localization audit: completed for application-controlled strings discovered
- dynamic role/permission/status/tier labels: localized
- terminology governance: updated
- Vercel preview build: PASS
- Vercel preview deployment: READY
- checked Vercel runtime error aggregation: no runtime errors

## Production verification — not yet claimable

The Vercel project currently has a READY preview deployment for the final implementation, but the available Vercel deployment-management interface did not provide a working promotion/redeploy operation for the merged `main` commit. The production domain still resolves to an older production deployment.

Therefore **production deployment and production AR/EN runtime verification are intentionally NOT marked PASS**.

This document must be changed to `CLOSED` only after the latest `main` commit is deployed to the production target and AR, EN, switching, and RTL/LTR are verified there.

## Governance

`I18N_TERMINOLOGY_AUDIT.md` remains the active canonical terminology governance document. Future PJ/admin work must continue using the render-time i18n contract and must pass the catalog integrity gate.
