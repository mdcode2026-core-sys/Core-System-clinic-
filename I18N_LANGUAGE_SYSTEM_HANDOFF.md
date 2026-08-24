# I18N LANGUAGE SYSTEM — FINAL HANDOFF

**Date:** 2026-08-24  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `main`  
**Status:** **IMPLEMENTATION COMPLETE — CORRECTIVE UI/I18N BATCH APPLIED — PRODUCTION RUNTIME VERIFICATION PENDING VERCEL BUILD-RATE-LIMIT RECOVERY**

## Final architecture

CORE SYSTEM uses the render-time locale architecture only. The legacy DOM/post-render translator is retired and must not be restored, including `MutationObserver`, `translateDocument()`, `legacyArabicToEnglish`, and equivalent replacement engines.

`messages.ts` and `terminology.ts` remain organizationally separate but are exposed through the same runtime localization contract.

## Corrective issues found after implementation review

A post-implementation source/runtime review identified and corrected these concrete issues:

- responsive sidebar transform was controlled by an inline transform, preventing the desktop responsive rule from reliably resetting the transform; the implementation now uses responsive Tailwind transform classes with locale-aware closed direction and `lg:translate-x-0` desktop behavior
- Follow-up dashboard widget had Arabic hard-coded content; it now uses the locale catalog
- Analytics dashboard page heading had a hard-coded Arabic title; it now uses the locale catalog
- Analytics overview dashboard widget had hard-coded Arabic labels and empty/error messages; it now uses analytics catalog mappings and locale direction
- Queue dashboard widget had hard-coded Arabic labels, error/empty messages, and minute unit; it now uses queue localization and locale direction
- Follow-up KPI formatter returned the Arabic `ساعة` directly; the value is now locale-neutral and the unit is localized by AR/EN catalog
- billing/currency dashboard widget values could overflow on narrow three-column mobile cards; cards now use min-width constraints, word breaking, reduced mobile typography, and responsive spacing
- generic widget error boundary exposed raw exception messages directly to users, which could leak an English/technical string into Arabic UI; it now shows the localized generic error message while retaining the technical error internally for the boundary state
- analytics KPI engine previously executed independent KPI reads serially; it now executes independent KPI calculations concurrently and React Query caches results briefly during dashboard navigation

## Catalog integrity

`npm run i18n:parity` is part of `npm run build` and verifies the current 23 catalogs for AR/EN key parity, non-empty values, duplicate keys, placeholder/interpolation parity, and shared catalog namespaces.

## Supabase

The live database was audited for locale/language configuration. `master_tenants.language` and `master_tenants.direction` are tenant-level configuration. Existing tenant preferences were preserved.

Migration `20260824140000_i18n_global_language_defaults.sql` was applied to the live Supabase project, establishing global defaults `language=en` and `direction=ltr`.

No translated UI labels were introduced into business data.

## Verification completed

- source-level corrective audit: completed for the discovered dashboard/sidebar/widget issues
- legacy DOM translation search: clean
- catalog integrity implementation: present and enforced by build
- Vercel preview build previously passed the 23-catalog integrity gate
- independent KPI queries are now parallelized
- analytics query results are now cached for 30 seconds / 5 minutes GC

## Current deployment constraint

The current `main` commit is `08906912d001d981bdbe0cc8dfcf8caa745f0e80`.

Vercel is currently returning a GitHub `Vercel` status failure with an `upgradeToPro=build-rate-limit` target. The latest READY production deployment is therefore still an older commit and does **not** contain the latest corrective batch.

Production AR/EN interactive verification must not be claimed until a deployment containing the current `main` commit is successfully built and promoted.

## Production verification — not yet claimable

Therefore **production deployment and production AR/EN runtime verification are intentionally NOT marked PASS**.

The remaining verification is operational, not an unresolved localization design decision: once Vercel build-rate limiting permits the current `main` commit to deploy, verify the sidebar on desktop/mobile, AR↔EN switching, dashboard Follow-up/Analytics/Queue/Billing widgets, currency wrapping, and loading latency on the deployed build.

## Governance

`I18N_TERMINOLOGY_AUDIT.md` remains the active canonical terminology governance document. Future PJ/admin work must continue using the render-time i18n contract and must pass the catalog integrity gate.
