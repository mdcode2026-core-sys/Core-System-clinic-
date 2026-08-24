# CORE SYSTEM — Bilingual Terminology & Localization Governance

## Final status

**Status: CLOSED / ACTIVE GOVERNANCE**  
The application-wide Arabic/English localization workstream is complete. This document remains the canonical terminology governance reference for future PJ and administrative work.

## Policy

CORE SYSTEM supports Arabic and English as first-class UI locales. English is the canonical development terminology; Arabic is an operational UI language and is reviewed for meaning and clinical usability rather than literal translation.

## Rules

1. UI terminology must be rendered through the localization layer, not DOM mutation or post-render phrase replacement.
2. A concept has one canonical English UI term and one approved Arabic UI term.
3. Navigation, page headings, widgets, dialogs, buttons, validation, errors, empty states, statuses, and placeholders must use localization keys.
4. User-authored clinical or tenant data is not translated automatically.
5. Database-backed business values should remain canonical codes; user-facing labels are localized at presentation time.
6. RTL/LTR follows the active locale: Arabic → RTL, English → LTR.
7. New features must add both locale resources before production.
8. Dynamic roles, permissions, statuses, notification types, subscription tiers and similar codes must use localization mappings rather than being displayed directly.
9. `messages.ts` and `terminology.ts` are parts of one unified localization contract, not competing runtime translation engines.

## Current canonical examples

| Concept | English | Arabic |
|---|---|---|
| Medical Workspace | Medical Workspace | المساحة الطبية |
| Operation Workspace | Operation Workspace | مساحة التشغيل |
| Medical Examination | Medical Examination | الفحص الطبي |
| Medical Files | Medical Files | الملفات الطبية |
| Treatment Plans | Treatment Plans | خطط العلاج |

## Verification governance

The repository build includes an automated catalog integrity gate covering the current 23 AR/EN catalog files for key parity, non-empty values, duplicate keys and placeholder parity.

Future UI work must preserve the render-time i18n architecture and must not reintroduce `MutationObserver`, DOM translation, `translateDocument()`, `legacyArabicToEnglish`, or equivalent post-render replacement mechanisms.

This document is a permanent governance reference. It does not authorize literal Arabic translations when a more natural operational term is appropriate.
