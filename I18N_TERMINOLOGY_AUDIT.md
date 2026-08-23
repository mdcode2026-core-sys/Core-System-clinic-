# CORE SYSTEM — Bilingual Terminology & Localization Audit

## Policy

CORE SYSTEM supports Arabic and English as first-class UI locales. English is the canonical development terminology; Arabic is an operational UI language and is reviewed for meaning and clinical usability rather than literal translation.

## Rules

1. UI terminology must be rendered through the localization layer, not DOM mutation or post-render phrase replacement.
2. A concept has one canonical English UI term and one approved Arabic UI term.
3. Navigation, page headings, widgets, dialogs, buttons, validation, errors, empty states, statuses, and placeholders must use localization keys.
4. User-authored clinical or tenant data is not translated automatically.
5. Database-backed system terminology must expose bilingual values where the product model requires user-facing labels.
6. RTL/LTR follows the active locale.
7. New features must add both locale resources before production.

## Current canonical examples

| Concept | English | Arabic |
|---|---|---|
| Medical Workspace | Medical Workspace | المساحة الطبية |
| Operation Workspace | Operation Workspace | مساحة التشغيل |
| Medical Examination | Medical Examination | الفحص الطبي |
| Medical Files | Medical Files | الملفات الطبية |
| Treatment Plans | Treatment Plans | خطط العلاج |

This document is a permanent governance reference. It does not authorize literal Arabic translations when a more natural operational term is appropriate.
