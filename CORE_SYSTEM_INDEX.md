# CORE_SYSTEM_INDEX.md

> Version: 1.2
> Status: Authoritative Reference
> Project: CORE SYSTEM
> Architecture: SaaS
> Owner: Yazeed Waleed
> Last Updated: 2026-07-23

---

# IMPORTANT

This document is the official engineering reference for the project.

Every new development session MUST begin by reading this document before writing a single line of code.

No assumption is allowed.

No file may be modified without understanding its dependencies.

If information is missing, STOP and ask.

Never invent architecture.

Never invent routes.

Never invent database structures.

The repository is always the primary source of truth.

---

# PROJECT OVERVIEW

Project Name

CORE SYSTEM

Full Name

ClinicSaaS™ Multi-Tenant Clinic Management Platform

Project Type

Software as a Service (SaaS)

Current State

Under active development.

Target

A complete operating system for aesthetic clinics, dermatology clinics, laser centers and expandable to other medical specialties.

---

# PROJECT PHILOSOPHY

CORE SYSTEM is NOT:

- Appointment booking software.
- CRM only.
- Medical records only.
- Billing software only.

CORE SYSTEM combines:

- Clinic Operations
- Medical Workflow
- Reception
- Queue Management
- Scheduling
- Billing
- Inventory
- Patient Journey
- Staff Evaluation
- Business Intelligence
- Analytics
- Subscription Management
- Multi-Tenant SaaS Platform

Every future decision must preserve this philosophy.

---

# CORE ENGINEERING PRINCIPLES

These rules are mandatory.

1.

The system remains SaaS permanently.

No architectural decision may convert it into a single-clinic application.

---

2.

Every clinic is an isolated tenant.

No clinic may access another clinic's data.

Tenant isolation is mandatory.

---

3.

Database is the single source of truth.

Business logic must never duplicate database rules.

---

4.

Architecture is more important than speed.

Never choose shortcuts that weaken scalability.

---

5.

Every solution must be scalable.

If the solution only works today, reject it.

---

6.

Backward compatibility must always be preserved.

---

7.

Never break working code to solve another problem.

---

8.

Every modification must be justified.

---

9.

Never modify files that you do not fully understand.

---

10.

If repository code conflicts with assumptions:

Repository always wins.

---

# CURRENT PROJECT STATUS

Current Phase

Phase 5 — Invoicing

Status

Implementation (Database Complete, Files Pending Installation)

Reason

Phase 1, 2, 3, 4 Core Implementation complete.

Phase 4 remains in Progressive Validation with 2 suspended items.

Phase 5 database schema, RLS, and Functions deployed.

Phase 5 TypeScript files created but not yet installed in repository.

---

# CURRENT TECHNOLOGY STACK

Frontend

- Next.js App Router
- React
- TypeScript
- TailwindCSS

Backend

- Supabase

Authentication

- Supabase Auth

Database

- PostgreSQL

Hosting

- Vercel

Repository

- GitHub

Development Environment

- GitHub Codespaces

---

# PROJECT DIRECTORY RULES

The repository is the only authoritative reference.

Documentation never overrides code.

Every path must be verified inside the repository.

Never guess folder names.

Never recreate folders.

Never duplicate routes.

Never create "temporary" folders.

---

# ROUTING RULES

Current dashboard route

src/app/(dashboard)/page.tsx

This is the official dashboard page.

The following route is considered INVALID unless the repository changes:

src/app/(dashboard)/dashboard/page.tsx

This mistake already happened during development.

It caused multiple routing failures.

Before modifying routing:

Verify repository structure.

Do not assume.

---

# DEVELOPMENT RULES

Before editing any file:

Read it completely.

Read every imported dependency.

Understand where it is used.

Understand what depends on it.

Only then modify it.

Never edit files blindly.

---

# MODIFICATION POLICY

Before changing any file the developer MUST answer:

What does this file do?

Who imports it?

What imports will break?

What routes depend on it?

What database tables depend on it?

What authentication logic depends on it?

What middleware depends on it?

If these answers are unavailable:

STOP.

Ask.

Do not modify.

---

# FILE CREATION POLICY

Never create new files unless ALL conditions are met.

Condition 1

No existing file already performs the same task.

Condition 2

The new file integrates correctly with the project.

Condition 3

The file naming follows project conventions.

Condition 4

Dependencies are verified.

Condition 5

Repository owner approves.

Otherwise:

Do not generate files.

---

# DATABASE POLICY

The database already exists.

Never recreate it.

Never redesign it.

Never generate schema from imagination.

Always inspect the current schema first.

Existing objects include:

Tables

Foreign Keys

Indexes

Functions

Triggers

Policies

RLS

JWT Hook

These are considered production assets.

Changes require verification.

---

# AUTHENTICATION POLICY

Authentication uses:

Supabase Auth

Project users are created through the official signup flow.

Authentication must never bypass Supabase.

Never store passwords manually.

Never duplicate authentication tables.

---

# MULTI TENANT POLICY

Every business entity belongs to one tenant.

Tenant isolation is mandatory.

Every protected query must respect tenant boundaries.

No exception.

---

# SUBSCRIPTION MODEL

Project type:

SaaS

Every clinic owns exactly one active subscription.

Registration starts a free trial.

Trial duration

14 days.

When the trial expires

Clinic access is suspended unless activated.

Activation occurs only through Super Admin.

Subscriptions are part of the architecture.

They are NOT optional.

---

# SUPER ADMIN RESPONSIBILITIES

Only Super Admin may

Activate subscriptions.

Reactivate expired clinics.

Suspend clinics.

Manage subscription lifecycle.

Override tenant status.

No clinic administrator may perform these actions.

---

# PROJECT OWNERSHIP

The project owner is NOT a programmer.

Therefore:

Every explanation must be written in simple language.

Avoid unnecessary technical jargon.

Explain decisions before implementation.

Never assume programming knowledge.

---

# PROJECT STATUS

## Current Development Status

Project State

Active Development

Architecture

Stable

Production

NO

Current Phase

Phase 5 — Invoicing

Completion

Database: 100% | TypeScript Files: Created (Pending Installation)

Phase 5 database deployed. Files ready for installation and build test.

---

## Phase 1 Objectives

Status: CLOSED

Authentication works.

Database exists.

Subscription bootstrap exists.

Dashboard routing stable.

Middleware validated.

JWT Claims validated.

RLS production verified.

---

## Phase 2 Objectives

Status: CLOSED

Patients Module complete.

---

## Phase 3 Objectives

Status: Progressive Validation

Agenda Module Core Implementation 85%.

Pending real data testing.

---

## Phase 4 Objectives

Status: Progressive Validation

Queue Module Core Implementation 85%.

Build successful.

RLS bugs resolved.

Legacy tables unified.

2 items suspended pending MyQueueView readiness.

---

## Phase 5 Objectives

Status: Implementation

Invoicing Module.

Database Schema: DEPLOYED

RLS Policies: DEPLOYED

Database Functions: DEPLOYED

TypeScript Types: CREATED (pending install)

Server Actions: CREATED (pending install)

UI Components: CREATED (pending install)

Build Test: PENDING

Manual Testing: PENDING

---

## Phase Completion Rule

A phase is NOT completed because code exists.

A phase is completed only when

Code exists.

Architecture is correct.

Dependencies are verified.

Manual testing passes.

Regression testing passes.

Documentation updated.

Only then may the next phase begin.

---

# CURRENT KNOWN PROBLEMS

The following issues are officially recognised.

They must never be forgotten.

---

Issue 001

Dashboard Routing

Description

Dashboard route repeatedly failed because incorrect path assumptions were made.

Correct route

src/app/(dashboard)/page.tsx

Incorrect route

src/app/(dashboard)/dashboard/page.tsx

This mistake already consumed many development hours.

Before changing routing

Verify repository.

Never assume.

Status: RESOLVED

---

Issue 002

Repeated Solutions

Several fixes were proposed repeatedly although they had already failed.

This is prohibited.

Whenever a solution fails

Record it.

Understand why.

Never suggest it again without new evidence.

---

Issue 003

Blind File Modification

Files were modified without fully understanding dependencies.

Result

New problems appeared.

New Rule

No file may be edited before dependency analysis.

---

Issue 004

Console Dependency

The project owner develops almost entirely from a mobile phone.

Developer must NOT depend on

Browser Console

Developer Tools

Network Tab

Local debugging

unless absolutely unavoidable.

Whenever possible

Create server-side diagnostics.

Explain exactly what information is required.

---

Issue 005

Artificial File Creation

Temporary files were repeatedly generated.

This increases project complexity.

New Rule

Never create helper files unless they become permanent project assets.

---

Issue 006

RLS Bugs

Description

3 RLS policies had critical flaws.

Status: RESOLVED

Policies fixed:

- rls_sessions_write_role_check
- rls_invoices_doctor_read
- rls_audit_read (includes receptionist)

---

Issue 007

Legacy Tables

Description

users vs clinic_users and tenants vs master_tenants caused data inconsistency.

Status: RESOLVED

AuthProvider now reads from clinic_users.

subscriptions and subscription_events FKs now point to master_tenants.

---

Issue 008

isDoctor Manual Flag

Description

queue/page.tsx uses isDoctor = false manually.

Status: SUSPENDED

Will be resolved when MyQueueView is production ready.

---

# OWNER CONSTRAINTS

Project Owner

Yazeed Waleed

Programming Experience

Limited

Preferred Communication

Simple Arabic.

No unnecessary technical language.

Explain decisions before implementation.

---

Available Devices

Primary Device

Android Phone

Computer

Limited availability.

Developer must minimise any requirement that depends on desktop debugging.

---

Decision Making

Developer provides

Options

Advantages

Disadvantages

Recommendation

Owner makes final decision.

No architectural decision may be taken without approval.

---

# COMMUNICATION RULES

Every answer must follow this order.

1.

Problem Summary

2.

Root Cause

3.

Evidence

4.

Recommended Solution

5.

Expected Impact

6.

Risk Level

7.

Files Affected

8.

Waiting For Approval

Never skip this structure.

---

If information is missing

Do not guess.

Ask.

Wait.

Continue only after receiving clarification.

---

القسم 17 — قواعد العمل الإلزامية (Engineering Contract)

هذه القواعد تعتبر عقد عمل هندسي.

يجب الالتزام بها في جميع المحادثات.

---

أولاً

لا يتم تعديل أي ملف إلا بعد فهم:

- الهدف من الملف
- علاقته ببقية الملفات
- علاقته بقاعدة البيانات
- تأثيره على المشروع

---

ثانياً

يمنع تعديل أي ملف بسبب التخمين.

إذا لم تكن المعلومات كافية يجب السؤال أولاً.

---

ثالثاً

إذا كان هناك أكثر من احتمال للمشكلة:

لا يتم اختيار أحدها عشوائياً.

بل يتم جمع الأدلة أولاً.

---

رابعاً

كل تعديل يجب أن يحتوي على:

- لماذا؟
- ماذا سيغير؟
- ماذا قد يكسر؟
- كيف سيتم التحقق؟

---

خامساً

أي حل سبق تجربته وفشل يمنع اقتراحه مرة أخرى إلا إذا تغير سبب المشكلة.

---

سادساً

أي تعديل معماري يحتاج تبريراً هندسياً.

وليس مجرد:

"هذا أفضل"

---

سابعاً

لا يتم إنشاء ملفات جديدة إلا إذا كانت جزءاً من التصميم الحقيقي.

---

ثامناً

إذا كان الملف لن يستخدم...

لا يتم إنشاؤه.

---

تاسعاً

كل قرار يجب أن يحافظ على:

- Multi Tenant
- SaaS
- Security
- Scalability
- Maintainability

---

القسم 18 — طريقة التواصل

أنا لست مبرمجاً.

لذلك يجب أن تكون جميع الإجابات بالشكل التالي.

---

عند شرح مشكلة

ماذا حدث؟

بلغة بسيطة.

---

لماذا حدث؟

بلغة بسيطة.

---

ما الحل؟

بلغة بسيطة.

---

لماذا اخترنا هذا الحل؟

بلغة بسيطة.

---

ماذا سألاحظ بعد التنفيذ؟

بلغة بسيطة.

---

يمنع استخدام مصطلحات معقدة دون شرحها.

---

القسم 19 — طريقة طلب المعلومات

إذا احتجت أي معلومة...

لا تخمن.

اطلبها مباشرة.

مثال:

أحتاج الملف التالي:

```
src/app/(dashboard)/layout.tsx
```

وسبب الحاجة:

لأنني أريد معرفة من أين يأتي Redirect.

---

أو

أحتاج نتيجة هذا الاستعلام.

وسبب الحاجة:

للتحقق من...

---

القسم 20 — طريقة اكتشاف الأخطاء

قبل اقتراح أي تعديل...

قم بهذه الخطوات.

١.

حدد المشكلة بدقة.

٢.

حدد الملفات المرتبطة بها.

٣.

حدد الجداول المرتبطة.

٤.

حدد Functions المرتبطة.

٥.

حدد Middleware.

٦.

حدد Routes.

٧.

حدد هل المشكلة Frontend أم Backend أم Auth أم Database.

بعد ذلك فقط...

ابدأ الحل.

---

القسم 21 — قاعدة منع تدمير النظام

إذا كان جزء من النظام يعمل...

لا يتم لمسه.

حتى لو كان يمكن تحسينه.

الأولوية دائماً:

استقرار النظام.

وليس إعادة كتابة الكود.

---

القسم 22 — سياسة الإصلاح

الإصلاح يكون دائماً:

Minimal Fix

وليس

Rewrite

إلا إذا ثبت هندسياً أن إعادة الكتابة ضرورية.

---

القسم 23 — تعريف نجاح المهمة

أي مهمة تعتبر ناجحة فقط إذا:

✅ الكود يعمل.

✅ Build ينجح.

✅ لا يوجد Regression.

✅ لا يتم كسر جزء آخر.

✅ تم التحقق عملياً.

وليس نظرياً.

---

القسم 24 — عند انتهاء كل جلسة

يجب إنشاء تقرير Handoff يحتوي على:

ما الذي تم؟

لماذا؟

الملفات المعدلة.

الجداول المعدلة.

Functions المعدلة.

Triggers المعدلة.

ما الذي بقي؟

ما الذي يمنع المتابعة؟

أول مهمة في الجلسة القادمة.

---

القسم 25 — ممنوعات المشروع

ممنوع:

- التخمين.
- التكرار.
- الحلول السطحية.
- إنشاء ملفات بلا استخدام.
- تغيير Architecture دون موافقة.
- حذف كود يعمل.
- تغيير مسارات دون التأكد.

---

القسم 26 — الحقيقة المرجعية للمشروع (Single Source of Truth)

أي معلومة يجب أن تعتمد على أحد المصادر التالية فقط:

1.

CORE_SYSTEM_INDEX.md

2.

مستودع GitHub

3.

Supabase Schema

4.

الكود الحالي

إذا تعارض مصدران...

يتم إيقاف التنفيذ وطلب القرار.

---

القسم 27 — قواعد محادثة جديدة

عند بدء أي محادثة جديدة يجب تنفيذ الخطوات التالية بالترتيب:

١.

قراءة CORE_SYSTEM_INDEX.md بالكامل.

٢.

قراءة آخر تقرير Handoff.

٣.

تلخيص فهم الحالة الحالية.

٤.

تحديد المرحلة الحالية.

٥.

تحديد المهمة الحالية فقط.

٦.

عدم الانتقال لأي مهمة أخرى.

---

القسم 28 — تعريف المرحلة الحالية

حتى يتم إصدار قرار جديد...

المشروع في:

Phase 5 — Invoicing

الهدف الوحيد:

تثبيت ملفات Phase 5 واختبار Build وإجراء اختبار عملي.

---

القسم 29 — المشاكل المفتوحة حالياً (Open Issues)

1. Dashboard Routing
- Status: RESOLVED

2. Redirect Loop (ERR_TOO_MANY_REDIRECTS)
- Status: RESOLVED

3. JWT Claims
- Status: VERIFIED

4. RLS Bugs (3 policies)
- Status: RESOLVED

5. Legacy Tables (users/clinic_users, tenants/master_tenants)
- Status: RESOLVED

6. isDoctor Manual Flag
- Status: SUSPENDED — waits MyQueueView

7. Kiosk Patient Integration
- Status: SUSPENDED — waits Patients Module

8. Phase 5 Files Installation
- Status: IN PROGRESS — Database deployed, TypeScript files created, pending install and build test

---

القسم 30 — الهدف النهائي للمشروع

CORE SYSTEM ليس مشروعاً تجريبياً.

بل منصة SaaS احترافية لإدارة العيادات قابلة للتوسع.

أي قرار هندسي يجب أن يخدم هذا الهدف.

وليس مجرد حل مشكلة مؤقتة.

---

نهاية الوثيقة

أي جلسة جديدة تبدأ من هذا الملف.

أي قرار جديد يضاف إلى هذه الوثيقة.

أي تغيير معماري يوثق هنا قبل تنفيذه.

هذه الوثيقة هي المرجع الرسمي والهندسي للمشروع.

---

APPENDIX A — PROJECT STATUS (LIVE)

> الغرض: هذا القسم هو المرجع الوحيد للحالة الحالية للمشروع. يتم تحديثه بعد نهاية كل جلسة عمل، ولا يُعدّل أي ملف أو قاعدة بيانات قبل قراءته بالكامل.

الحالة الحالية

المشروع

Project: CORE SYSTEM

Architecture: SaaS Multi-Tenant

Framework: Next.js App Router

Database: Supabase

Deployment: Vercel

Repository: GitHub

Development: GitHub Codespaces

---

القرارات المعمارية المعتمدة (Architecture Decisions)

معتمد

Next.js App Router.

Multi-Tenant Architecture.

SaaS Architecture.

Vertical Slice Architecture.

TypeScript.

Supabase Auth.

RLS.

JWT Claims.

Database Functions للعمليات الذرية فقط (Atomic Operations).

Server Actions لباقي منطق الأعمال.

Subscription مستقل عن بيانات العيادة.

لا يوجد أي تعديل معماري دون موافقة.

---

الحالة الحالية لقاعدة البيانات

تم إنشاء الجداول الأساسية.

تم إنشاء العلاقات الأساسية.

تم إنشاء:

RLS

Policies

Indexes

Triggers

Database Functions

RLS Bugs: RESOLVED

Legacy Tables: UNIFIED

Phase 5 Tables Deployed:
- clinic_procedures (modified: +procedure_code, +tax_included, +tax_rate_percent)
- clinic_invoices (modified: +invoice_number, +issued_at, +payment_terms, +notes)
- invoice_items (new: 15 columns)
- invoice_payments (new: 12 columns)

Phase 5 Functions Deployed:
- generate_invoice_number()
- can_edit_invoice()
- create_invoice_from_session()
- recalculate_invoice_totals()
- issue_invoice()
- record_invoice_payment()
- cancel_invoice()

Phase 5 RLS Deployed:
- invoice_items: SELECT, INSERT, UPDATE, DELETE
- invoice_payments: SELECT, INSERT, UPDATE, DELETE

---

الحالة الحالية للمشكلة

المشكلة الحالية ليست قاعدة البيانات.

المشكلة الحالية ليست الجداول.

المشكلة الحالية ليست Functions.

المشكلة الحالية ليست Authentication.

المشكلة الحالية هي:

Phase 5 — Invoicing: Files Installation and Build Test

---

المسار الصحيح للـ Dashboard

المسار الصحيح المعتمد هو:

src/app/(dashboard)/page.tsx

وليس:

src/app/(dashboard)/dashboard/page.tsx

أي اقتراح يعتمد على المسار الثاني يجب اعتباره غير صحيح حتى يثبت العكس من خلال مراجعة المشروع الحقيقي.

---

قاعدة ذهبية

لا يتم اقتراح أي تعديل على:

Routes

Middleware

Layout

Auth

Dashboard

قبل مراجعة الملفات الأصلية الموجودة داخل المشروع.

---

قبل أي تعديل

يجب التأكد من:

مسار الملف الحقيقي.

الملف الذي يستورده.

الملفات التي تستورده.

تأثير التعديل على Authentication.

تأثير التعديل على Middleware.

تأثير التعديل على Dashboard.

---

بعد كل جلسة

يجب تحديث فقط:

Current Status

Current Blocker

Completed Tasks

Next Task

ولا يتم إعادة كتابة الملف بالكامل.

---

فلسفة المشروع

الهدف ليس جعل المشروع يعمل اليوم فقط.

الهدف هو بناء منصة SaaS مستقرة تستطيع العمل سنوات دون إعادة بناء.

أي حل سريع يكسر التصميم الهندسي يعتبر مرفوضاً.

أي تعديل يجب أن يجعل المشروع أكثر استقراراً وليس فقط يزيل الخطأ الحالي.

---

المرجع الأساسي

أي محادثة جديدة تبدأ بالترتيب التالي:

1. CORE_SYSTEM_INDEX.md

2. تقرير آخر جلسة (Session Report)

3. أي ملفات إضافية مطلوبة.

---

APPENDIX B — PHASE 5 INVOICING STATUS

> آخر تحديث: 2026-07-23

Database Schema: ✅ DEPLOYED
- 26 SQL commands executed successfully
- All tables verified (22, 14, 15, 12 columns)
- All constraints verified
- All indexes created
- All functions deployed
- All RLS policies active

Files Status: ⏳ CREATED (not installed)
- invoicing.types.ts: ready
- invoicing.calculator.ts: ready
- invoicing.actions.ts: ready
- invoicing.queries.ts: ready
- invoice-list.tsx: ready
- invoice-detail.tsx: ready
- invoice-form.tsx: ready
- invoices/page.tsx: ready
- invoices/new/page.tsx: ready
- invoices/[id]/page.tsx: ready

Next Tasks:
1. Install TypeScript files into repository
2. Update database.types.ts
3. Run npm run build
4. Fix any TypeScript errors
5. Manual testing
6. Update CORE_SYSTEM_INDEX.md to CLOSED status

Files Needed from Repository:
- src/infrastructure/supabase/server.ts
- src/infrastructure/supabase/database.types.ts
- src/core/auth/AuthProvider.tsx
- src/app/(dashboard)/layout.tsx
- src/app/(dashboard)/page.tsx
