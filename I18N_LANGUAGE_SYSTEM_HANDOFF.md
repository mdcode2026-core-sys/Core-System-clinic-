# I18N LANGUAGE SYSTEM — HANDOFF REPORT

**Date:** 2026-08-24  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `main`  
**Status:** **INCOMPLETE — ACTIVE CORRECTION REQUIRED**

---

## 1. Purpose of this document

This document is the handoff for a dedicated future workstream covering the CORE SYSTEM bilingual language system (Arabic / English).

It is intentionally independent from the Patient Journey stage workflow. The next language-focused conversation should use this document as its starting context and should not repeat the historical investigation unless new evidence contradicts it.

The goal is **not** to restore the legacy translation mechanism. The goal is to complete the newer render-time i18n architecture already adopted in the repository and make AR ↔ EN switching complete, consistent, maintainable and permanent across the application.

---

## 2. Current conclusion

The repository has already migrated away from the old DOM/post-render translation architecture.

The newer architecture is present and actively used:

- `src/core/i18n/I18nProvider.tsx`
- `src/core/i18n/LanguageSwitcher.tsx`
- `src/core/i18n/messages.ts`
- `src/core/i18n/terminology.ts`

The migration was **not completed across the whole application**.

Therefore the correct status is:

> **Architecture migration: completed.**  
> **Application-wide localization migration: incomplete.**

Observed user-visible symptoms are consistent with incomplete migration:

- switching Arabic ↔ English does not translate every visible element;
- some screens are bilingual only partially;
- some labels/messages can remain in the other language;
- terminology consistency is not guaranteed everywhere;
- different components have historically used different translation approaches.

Do **not** interpret the existence of `messages.ts` and `terminology.ts` as evidence that the application is fully localized.

---

## 3. Historical migration — important context

Git history shows a deliberate transition from the legacy DOM translation system to render-time locale context.

A key refactor was:

`500e6732f35d29c951b0d5c3da3bf11bf33493bd`

`refactor(i18n): replace DOM translation with render-time locale context`

The legacy mechanism included concepts such as:

- `legacyArabicToEnglish`
- `flattenMessages`
- translation maps
- `MutationObserver`
- `translateDocument()`

Those mechanisms were removed in favor of render-time locale context.

This decision is **settled** and must not be reopened merely to make missing translations appear automatically.

The correct implementation model is render-time localization at the component/source level.

---

## 4. Second phase — canonical terminology

After the render-time migration, the project introduced a canonical terminology layer.

Relevant historical commits include:

- `ef2539a` — `add canonical medical and operation terminology`
- `e6adebdcb3217bcc14c10fecb938c63f235b2c5e` — `expose canonical terminology through provider`

The provider consequently exposes both messages and terminology.

This explains the current structure:

```text
I18nProvider
   ├── messages
   └── terminology
```

The architecture itself is not necessarily wrong. The problem is that the application-wide migration/coverage is incomplete and the separation can create inconsistent usage if components treat terminology as a second independent translation system.

---

## 5. Current source responsibilities

### `src/core/i18n/messages.ts`

Primary catalog for general UI/application messages.

Examples include navigation, actions, status labels, form messages and other user-facing strings.

### `src/core/i18n/terminology.ts`

Canonical bilingual domain terminology, particularly medical/clinical/operational terms.

Examples documented by the terminology governance include concepts such as:

- Medical Workspace → المساحة الطبية
- Operation Workspace → مساحة التشغيل
- Medical Examination → الفحص الطبي
- Medical Files → الملفات الطبية
- Treatment Plans → خطط العلاج

### `src/core/i18n/I18nProvider.tsx`

Runtime locale context. It provides the current locale, messages and canonical terminology and handles language/direction state.

### `src/core/i18n/LanguageSwitcher.tsx`

User-facing AR ↔ EN language switching.

### `I18N_TERMINOLOGY_AUDIT.md`

This is a **governance/reference document**, not the runtime language file. It should remain an active root-level document. It must not be archived merely because it is named `AUDIT`.

It should, however, explicitly distinguish the architectural migration being complete from application-wide localization coverage still being incomplete.

---

## 6. Direction and persistence

The newer runtime supports:

- `ar`
- `en`

and maps the direction as:

- Arabic → RTL
- English → LTR

The language is persisted through the existing browser state/cookie mechanisms used by the i18n implementation.

This part of the architecture should be preserved unless a new audit proves a concrete defect.

---

## 7. What must NOT be done

The next implementation team/agent must **not**:

1. Reintroduce `MutationObserver` translation.
2. Reintroduce `legacyArabicToEnglish`.
3. Translate rendered DOM text after React renders.
4. Create another translation dictionary competing with the existing catalogs.
5. Hide missing translations with automatic English/Arabic string replacement.
6. Treat `terminology.ts` as a second independent i18n engine.
7. Mark i18n complete merely because the language switcher changes the locale.
8. Fix only the pages where the user notices a visible problem while leaving the underlying coverage incomplete.
9. Rewrite historical Git decisions without evidence.

The permanent solution is to complete localization at the source/component level using the adopted render-time architecture.

---

## 8. Required target architecture

The intended end state is conceptually:

```text
                I18nProvider
                     │
          ┌──────────┴──────────┐
          │                     │
      UI messages       Canonical terminology
          │                     │
          └──────────┬──────────┘
                     │
                UI Components
                     │
              AR / EN rendering
```

There must be one coherent runtime localization model.

`messages.ts` and `terminology.ts` may remain physically separate for maintainability if that separation is useful, but they must behave as one coherent localization contract rather than competing sources.

---

## 9. Evidence of incomplete application coverage

Repository searches show i18n usage in a number of migrated components, including examples such as:

- Patients pages/components
- `OperationWorkspace.tsx`
- `ClinicalWorkspace.tsx`
- `WorkspaceShell.tsx`
- Roles/Permissions editor
- `TreatmentPlanWorkspace.tsx`
- Patient Portal messaging
- navigation registry

However, the repository history contains a sequence of incremental commits such as `feat(i18n): cover ...` and `refactor(i18n): localize ...`, which demonstrates that migration was being performed progressively rather than closed as a completed application-wide conversion.

The current GitHub search also confirms the active i18n source files and migrated component usage, but this is not sufficient to certify every user-facing string as localized.

Therefore the next workstream must perform an exhaustive source-level coverage audit rather than relying on a few representative pages.

---

## 10. Required audit scope for the dedicated language workstream

The next conversation should audit the entire application, not just the Patient Journey.

### A. Catalog integrity

Compare Arabic and English catalogs for:

- missing keys
- extra keys
- duplicate semantic keys
- inconsistent placeholders
- malformed interpolation variables
- inconsistent pluralization where applicable
- empty translations
- accidental identical AR/EN values where they should differ
- terminology drift

### B. Component coverage

Identify all user-facing components and classify every visible string as:

1. localized through the current system;
2. canonical terminology;
3. intentionally language-neutral;
4. hard-coded and requiring migration;
5. dynamically generated and requiring a translation strategy;
6. third-party/system text outside application control.

### C. Runtime coverage

Verify language switching across all application areas, including at minimum:

- authentication
- dashboard
- navigation/sidebar
- patients
- patient detail
- appointments/scheduling
- operation workspace
- clinical workspace
- treatment plans
- medical files/photos
- follow-up/retention
- notifications
- patient portal
- billing/subscription areas
- settings
- roles/permissions
- audit/activity
- forms/dialogs/toasts/errors/empty states

### D. Directionality

Verify AR/EN changes not only text but also:

- `dir`
- layout direction
- alignment
- icons with directional meaning
- tables
- dialogs
- dropdowns
- breadcrumbs
- navigation
- date/time presentation where locale-sensitive
- numeric presentation where applicable

### E. Dynamic content

Audit strings generated from:

- status values
- permission labels
- role labels
- notification types
- appointment states
- treatment-plan states
- procedure labels
- validation errors
- server-action errors
- empty/loading/error states

These must not fall back unpredictably to the opposite language.

---

## 11. Required implementation strategy

After the audit, implement the migration systematically:

1. Define the canonical translation contract.
2. Resolve catalog gaps and inconsistent terminology.
3. Establish the correct boundary between general messages and canonical domain terminology.
4. Migrate components still containing user-facing hard-coded strings.
5. Ensure dynamic labels use the same localization contract.
6. Remove obsolete/duplicate translation paths discovered during migration.
7. Add regression checks that prevent new untranslated user-facing strings where practical.
8. Validate AR and EN separately across the full application.
9. Validate RTL/LTR layout behavior.
10. Run TypeScript, lint and build.
11. Perform runtime/browser verification where possible.
12. Only then mark the language system complete.

---

## 12. Definition of Done

I18N must not be marked closed until all of the following are true:

- Every supported application surface has AR and EN coverage.
- Switching AR ↔ EN updates all application-controlled visible text.
- No legacy DOM translation mechanism exists or is required.
- No competing translation engine exists.
- Canonical terminology is used consistently.
- Dynamic status/role/permission/error labels are localized.
- RTL/LTR behavior is correct.
- Empty/loading/error states are localized.
- Forms and validation messages are localized.
- Patient Journey and administrative surfaces use the same language architecture.
- TypeScript passes.
- Lint passes.
- Build passes.
- Runtime/browser verification passes for representative and high-risk surfaces.
- Documentation reflects the actual implementation.

---

## 13. Documentation relationship

### Keep active

- `I18N_TERMINOLOGY_AUDIT.md`
- this file: `I18N_LANGUAGE_SYSTEM_HANDOFF.md`

### Update when implementation changes

- `I18N_TERMINOLOGY_AUDIT.md`
- general project documentation only where language architecture/status is referenced

### Do not use as current implementation authority

Historical i18n commits and archived progress reports are evidence of how the migration happened, not instructions for rebuilding the old system.

---

## 14. Important project decisions already settled

The following are considered settled unless concrete implementation evidence proves they are technically invalid:

- Arabic and English are supported application locales.
- Arabic is RTL; English is LTR.
- The render-time i18n architecture is the current architecture.
- The old post-render DOM translation architecture is retired.
- Canonical terminology must be consistent across clinical and operational UI.
- The language system should be completed as a platform-wide capability, not page-by-page patches.

---

## 15. Recommended first action in the new conversation

Start by stating:

> "Use `I18N_LANGUAGE_SYSTEM_HANDOFF.md` as the baseline. Do not redesign the language architecture or restore the legacy DOM translator. Perform an exhaustive repository audit of the current AR/EN implementation, catalog integrity, component coverage, dynamic strings and RTL/LTR behavior. Then implement the missing migration work until the Definition of Done is satisfied."

The new workstream should verify the current repository state first because the code may evolve after this handoff.

---

## 16. Final status at handoff

**I18N architecture:** 🟢 Adopted/new architecture present  
**Legacy DOM translation:** 🔴 Retired / must not be restored  
**AR/EN catalog:** 🟡 Exists but requires exhaustive integrity audit  
**Component localization:** 🟡 Incomplete migration  
**Terminology governance:** 🟢 Established, but must be reconciled with implementation  
**AR ↔ EN completeness:** 🔴 Not yet certified  
**RTL/LTR completeness:** 🟡 Requires full application verification  
**Overall:** 🟡 **OPEN — LANGUAGE WORKSTREAM NOT CLOSED**

This status is intentional. The purpose of the next dedicated language workstream is to turn this into a verified, application-wide, production-quality bilingual system rather than to declare completion based on partial coverage.
