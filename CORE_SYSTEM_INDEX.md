# CORE_SYSTEM_INDEX.md

> Version: 1.0
> Status: Authoritative Reference
> Project: CORE SYSTEM
> Architecture: SaaS
> Owner: Yazeed Waleed

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

Phase 1

Foundation

Status

NOT CLOSED

Reason

Authentication works.

Database exists.

Subscription bootstrap exists.

Dashboard routing is unstable.

Middleware requires final validation.

JWT Claims require validation.

RLS requires production verification.

Dashboard cannot yet be considered production ready.

No Phase 2 development may begin until Phase 1 is officially completed.

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
# PROJECT STATUS

## Current Development Status

Project State

Active Development

Architecture

Stable

Production

NO

Current Phase

Phase 1 — Foundation

Completion

Approximately 85%

Phase 1 cannot be closed until every item below is verified.

---

## Phase 1 Objectives

The objective of Phase 1 is NOT to build features.

The objective is to build a stable foundation that every future module depends on.

If Phase 1 contains hidden problems, every future phase will inherit them.

Therefore stability is more important than speed.

---

## Phase 1 Deliverables

Authentication

Status:
Almost Complete

Remaining

JWT validation

Session validation

Production testing

---

Database

Status

Implemented

Includes

Tables

Relations

Indexes

Triggers

Functions

Policies

RLS

Audit

Subscriptions

Remaining

Production verification only.

---

Multi Tenant

Status

Implemented

Remaining

Cross Tenant Verification.

Every clinic must only access its own records.

---

Subscription Bootstrap

Status

Implemented

Current Flow

User Registration

↓

Create Auth User

↓

Create Tenant

↓

Create Subscription

↓

Create Owner

↓

Return Success

Remaining

Production validation.

---

Dashboard

Status

Incomplete

Reason

Routing still requires verification.

Dashboard is not considered complete until navigation works correctly after login.

---

Middleware

Status

Needs Verification

No assumptions are accepted.

Routing must be verified against repository.

---

JWT Claims

Status

Implemented

Remaining

Validation

Claims must always include

Tenant ID

User Role

No feature depending on JWT should be developed before verification.

---

RLS

Status

Enabled

Remaining

Real testing.

Not SQL Editor testing.

Real authenticated user testing.

---

Audit System

Status

Implemented

Triggers exist.

Audit tables exist.

Verification still required.

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

```
# CORE_SYSTEM_INDEX.md
## الجزء الأخير — قواعد العمل الإلزامية + سجل المشروع + آلية الاستمرار

---

# القسم 17 — قواعد العمل الإلزامية (Engineering Contract)

هذه القواعد تعتبر عقد عمل هندسي.

يجب الالتزام بها في جميع المحادثات.

---

## أولاً

لا يتم تعديل أي ملف إلا بعد فهم:

- الهدف من الملف
- علاقته ببقية الملفات
- علاقته بقاعدة البيانات
- تأثيره على المشروع

---

## ثانياً

يمنع تعديل أي ملف بسبب التخمين.

إذا لم تكن المعلومات كافية يجب السؤال أولاً.

---

## ثالثاً

إذا كان هناك أكثر من احتمال للمشكلة:

لا يتم اختيار أحدها عشوائياً.

بل يتم جمع الأدلة أولاً.

---

## رابعاً

كل تعديل يجب أن يحتوي على:

- لماذا؟
- ماذا سيغير؟
- ماذا قد يكسر؟
- كيف سيتم التحقق؟

---

## خامساً

أي حل سبق تجربته وفشل يمنع اقتراحه مرة أخرى إلا إذا تغير سبب المشكلة.

---

## سادساً

أي تعديل معماري يحتاج تبريراً هندسياً.

وليس مجرد:

"هذا أفضل"

---

## سابعاً

لا يتم إنشاء ملفات جديدة إلا إذا كانت جزءاً من التصميم الحقيقي.

---

## ثامناً

إذا كان الملف لن يستخدم...

لا يتم إنشاؤه.

---

## تاسعاً

كل قرار يجب أن يحافظ على:

- Multi Tenant
- SaaS
- Security
- Scalability
- Maintainability

---

# القسم 18 — طريقة التواصل

أنا لست مبرمجاً.

لذلك يجب أن تكون جميع الإجابات بالشكل التالي.

---

## عند شرح مشكلة

### ماذا حدث؟

بلغة بسيطة.

---

### لماذا حدث؟

بلغة بسيطة.

---

### ما الحل؟

بلغة بسيطة.

---

### لماذا اخترنا هذا الحل؟

بلغة بسيطة.

---

### ماذا سألاحظ بعد التنفيذ؟

بلغة بسيطة.

---

يمنع استخدام مصطلحات معقدة دون شرحها.

---

# القسم 19 — طريقة طلب المعلومات

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

# القسم 20 — طريقة اكتشاف الأخطاء

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

# القسم 21 — قاعدة منع تدمير النظام

إذا كان جزء من النظام يعمل...

لا يتم لمسه.

حتى لو كان يمكن تحسينه.

الأولوية دائماً:

استقرار النظام.

وليس إعادة كتابة الكود.

---

# القسم 22 — سياسة الإصلاح

الإصلاح يكون دائماً:

Minimal Fix

وليس

Rewrite

إلا إذا ثبت هندسياً أن إعادة الكتابة ضرورية.

---

# القسم 23 — تعريف نجاح المهمة

أي مهمة تعتبر ناجحة فقط إذا:

✅ الكود يعمل.

✅ Build ينجح.

✅ لا يوجد Regression.

✅ لا يتم كسر جزء آخر.

✅ تم التحقق عملياً.

وليس نظرياً.

---

# القسم 24 — عند انتهاء كل جلسة

يجب إنشاء تقرير Handoff يحتوي على:

## ما الذي تم؟

## لماذا؟

## الملفات المعدلة.

## الجداول المعدلة.

## Functions المعدلة.

## Triggers المعدلة.

## ما الذي بقي؟

## ما الذي يمنع المتابعة؟

## أول مهمة في الجلسة القادمة.

---

# القسم 25 — ممنوعات المشروع

ممنوع:

- التخمين.
- التكرار.
- الحلول السطحية.
- إنشاء ملفات بلا استخدام.
- تغيير Architecture دون موافقة.
- حذف كود يعمل.
- تغيير مسارات دون التأكد.

---

# القسم 26 — الحقيقة المرجعية للمشروع (Single Source of Truth)

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

# القسم 27 — قواعد محادثة جديدة

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

# القسم 28 — تعريف المرحلة الحالية

حتى يتم إصدار قرار جديد...

المشروع في:

## Phase 1 Foundation

الهدف الوحيد:

إيصال النظام إلى أول نسخة مستقرة قابلة للعمل.

ولا يسمح بإضافة ميزات جديدة قبل إغلاق هذه المرحلة.

---

# القسم 29 — المشاكل المفتوحة حالياً (Open Issues)

هذه هي المشاكل المعروفة حالياً والتي يجب اعتبارها مرجعاً حتى يتم إغلاقها رسمياً:

### 1. Dashboard Routing
- يوجد التباس سابق حول المسار الصحيح.
- المسار المعتمد:
  `src/app/(dashboard)/page.tsx`
- يمنع إنشاء أو الاعتماد على:
  `src/app/(dashboard)/dashboard/page.tsx`
  إلا إذا تغيرت البنية المعمارية بقرار موثق.

### 2. Redirect Loop
- توجد حلقة إعادة توجيه تمنع الوصول إلى Dashboard.
- لا يتم اقتراح أي تعديل جديد قبل تحديد السبب الحقيقي بالأدلة.

### 3. JWT Claims
- موجودة تصميمياً.
- تحتاج تحقق عملي قبل اعتمادها.

### 4. RLS
- السياسات موجودة.
- لم يتم التحقق الكامل من عزل البيانات عملياً.

---

# القسم 30 — الهدف النهائي للمشروع

CORE SYSTEM ليس مشروعاً تجريبياً.

بل منصة SaaS احترافية لإدارة العيادات قابلة للتوسع.

أي قرار هندسي يجب أن يخدم هذا الهدف.

وليس مجرد حل مشكلة مؤقتة.

---

# نهاية الوثيقة

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


يوجد Function رئيسية:

create_tenant_with_subscription

وهي المرجع الوحيد لإنشاء Tenant جديد.


---

الحالة الحالية للمشكلة

المشكلة الحالية ليست قاعدة البيانات.

المشكلة الحالية ليست الجداول.

المشكلة الحالية ليست Functions.

المشكلة الحالية هي:

Authentication Flow
+
Middleware
+
Dashboard Routing

وبشكل أدق:

ERR_TOO_MANY_REDIRECTS

حتى يتم حلها لا يتم الانتقال لأي مرحلة أخرى.


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




