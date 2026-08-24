# CORE SYSTEM — I18N Completion Execution Plan

Status: **OPEN — execution owned by the I18N workstream**  
Owner: **ChatGPT / CORE SYSTEM orchestration**  
Architecture: **render-time locale context only**  
Locales: **Arabic (`ar`) / English (`en`)**

## Purpose

This document converts the application-wide I18N completion work into a controlled execution sequence. The sequence is not 19 unrelated architecture phases. It is **19 execution workstreams/checkpoints** under one I18N completion program. They are ordered to minimize regressions and prevent partial localization from being mistaken for completion.

## Non-negotiable architecture

- `I18nProvider` + unified localization contract is the runtime source of truth.
- Arabic and English catalogs remain synchronized.
- No `MutationObserver` translation.
- No DOM/post-render translation.
- No `translateDocument()` or legacy replacement engine.
- Business/domain data remains canonical; UI labels are localized at render time.
- Arabic = RTL; English = LTR.
- Do not introduce a competing translation system merely to fix an individual screen.

## Execution workstreams

### W01 — Admin / Settings
Dashboard-adjacent administration, clinic profile, rooms, system preferences, templates, notification settings, users, roles, permissions, overrides, subscription and admin dialogs/states.

**Exit:** all user-facing strings in this workstream use the unified localization contract; roles/permissions are rendered through canonical mappings.

**Progress:** **IMPLEMENTATION COMPLETE — VERIFICATION PENDING.** Clinic Profile, Rooms & Resources, System Preferences, Users, Permission Overrides, User Permission Editor, Roles/Role Card, Subscription Center, Audit/Activity, Settings navigation, and the W01 verification workflow have now been migrated to locale-aware rendering. A dedicated `adminMessages` catalog is exposed by `I18nProvider` so these surfaces share the same render-time locale context rather than creating a competing translation engine. W01 is not marked CLOSED until the exact release commit passes static checks and runtime AR/EN verification.

### W02 — Patients / Appointments
Patient list, patient profile, registration, appointments, scheduling, filters, forms, empty/loading/error/success states.

**Exit:** AR/EN parity and no direct status/enum rendering.

### W03 — Clinical / Procedures
Clinical workspace, examination, procedure selection, clinical actions and clinical states.

**Exit:** canonical medical terminology and complete AR/EN rendering.

### W04 — Treatment Plans / Follow-up / Medical Files
Treatment plans, stages/items, follow-up, medical files and related dialogs/errors.

**Exit:** dynamic statuses and clinical labels localized without changing stored business codes.

### W05 — Notifications / Patient Portal
Notifications, notification preferences, portal entry/invite, portal-facing states and messages.

**Exit:** user-facing notifications and portal UI support both locales.

### W06 — Billing / Subscription / Inventory
Billing, invoices, subscription UI, inventory and transaction states.

**Exit:** currency/number/date presentation follows locale while business values remain unchanged.

### W07 — Analytics / Reporting / Audit
Analytics, reports, KPI labels, chart legends, audit/activity UI and export-related labels.

**Exit:** no raw event/status/metric codes exposed as UI labels.

### W08 — Server Messages / Error Strategy
Server Actions, route handlers, validation, access-denied responses and user-facing errors.

**Exit:** technical errors remain technical; user-facing errors are represented through stable codes/keys and localized at the UI boundary.

### W09 — Status / Role / Permission Mappings
Centralize mappings for statuses, roles, permissions, notification types, appointment/visit/treatment statuses and similar enums.

**Exit:** no raw canonical codes are displayed unintentionally.

### W10 — Forms / Dialogs / UI States
Cross-application sweep of labels, placeholders, helper text, required text, validation, confirmation, loading, empty, error and success states.

**Exit:** all identified user-facing static strings are localized or explicitly classified as non-localizable.

### W11 — RTL / LTR Structural Audit
Direction, logical spacing, alignment, tables, forms, dialogs, navigation, breadcrumbs, tabs, pagination and directional icons.

**Exit:** AR renders RTL and EN renders LTR without unnecessary redesign.

### W12 — Date / Number / Currency / Time Formatting
Locale-aware presentation for dates, times, numbers, currency and relative dates.

**Exit:** formatting changes with locale; stored business data does not.

### W13 — Terminology Governance Reconciliation
Reconcile implementation against `I18N_TERMINOLOGY_AUDIT.md`; eliminate conflicting translations and preserve approved canonical medical/operational terminology.

**Exit:** one canonical UI term per governed concept in each locale.

### W14 — Catalog Integrity Audit
AR/EN key parity, duplicate keys, empty values, placeholder parity, orphan keys and missing keys.

**Exit:** catalog integrity passes automated checks and manual review of intentional dynamic namespaces.

### W15 — Hard-coded String Classification Audit
Complete `.ts/.tsx/.js/.jsx` sweep. Classify every relevant finding as localization-required, canonical terminology, dynamic data, technical, developer-only or third-party/system-generated.

**Exit:** no unresolved user-facing findings; non-localizable findings are documented/classified rather than blindly translated.

### W16 — Static Quality Gate
TypeScript, ESLint, build and I18N audit.

**Exit:** all required checks pass on the exact release commit.

### W17 — Runtime AR/EN Verification
Browser verification of core routes and UI states in Arabic and English, including session switching.

**Exit:** no runtime localization regressions or console errors attributable to I18N.

### W18 — Supabase / Vercel / Production Verification
Verify locale persistence/configuration, RLS integrity, deployed artifact/commit, production runtime, AR/EN switching and RTL/LTR.

**Exit:** production is demonstrably running the release commit and both locales work in production.

### W19 — Documentation / Closure
Update `I18N_LANGUAGE_SYSTEM_HANDOFF.md` and `I18N_TERMINOLOGY_AUDIT.md` to reflect verified reality, remove temporary artifacts, record final commit/deployment and close the workstream.

**Exit:** every Definition-of-Done item has evidence; I18N is marked CLOSED only after production verification.

## Operating rule

The workstream owner may resolve implementation details without reopening settled architecture decisions. If a finding is ambiguous, classify it using the rules above rather than translating it blindly. If a technical blocker prevents a checkpoint, record the exact blocker and continue independent workstreams; do not weaken the definition of done.

## Release discipline

- Keep I18N changes isolated from unrelated product changes.
- Prefer small, domain-focused commits.
- Do not merge a checkpoint merely because build passes.
- Production closure requires runtime evidence.
- No claim of PASS without an actual check.

## Current baseline

The first I18N repair batch has already been published to `main`. W01 implementation is now complete across the identified administration surfaces, but verification remains open. W02 and all later workstreams remain OPEN until their exit criteria are verified. The current program status remains **OPEN** until W19 is completed.
