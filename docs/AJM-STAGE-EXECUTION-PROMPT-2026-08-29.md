# CORE SYSTEM — Approved AJM Stage Execution Prompt

انسخ هذا البرومبت عند فتح محادثة جديدة لتنفيذ أي AJM Stage، مع استبدال `[STAGE]` بالمرحلة المطلوبة.

---

## EXECUTION MANDATE

اذهب إلى مستودع CORE SYSTEM:

`mdcode2026-core-sys/Core-System-clinic-`

والفرع الرئيسي:

`main`

نفّذ **[STAGE]** تنفيذًا كاملًا من البداية إلى الإغلاق الإنتاجي، وفقًا للوثائق الحاكمة في المستودع، وبالأخص:

- `docs/AJM-EXECUTION-HANDOFF-2026-08-29.md`
- `docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md`
- `docs/PJ-AJM-UX-DEEP-RECONCILIATION-2026-08-29.md`
- `docs/CORE-SYSTEM-TERMINOLOGY-GLOSSARY-2026-08-29.md`
- `docs/TERMINOLOGY-APPLICATION-REGISTER-2026-08-29.md`
- وثائق AJM الخاصة بالمرحلة
- وثائق UX/IA ذات الصلة
- وثائق PJ ذات الصلة

### 1. لا تعتمد على الذاكرة
افحص الحالة الفعلية للمستودع والفروع والكود وSupabase والاختبارات والواجهات. اعتبر [STAGE] **غير منفذة لأغراض القبول** حتى لو وجدت تنفيذًا أو وثيقة تاريخية تقول CLOSED.

### 2. نفّذ Pre-Stage Audit أولًا
قبل أي تعديل:
- راجع AJM.
- راجع UX/IA.
- راجع PJ.
- افحص `main` والفروع ذات الصلة.
- افحص التنفيذ الحالي والم migrations والاختبارات.
- افحص Supabase schema/data/RLS/functions/triggers ذات الصلة.
- حدّد ما هو موجود ويمكن إعادة استخدامه.
- حدّد التعارضات والانحرافات.
- صنّف العمل السابق: KEEP / CLARIFY / RENAME / RECONCILE / SUPERSEDE / HISTORICAL.

لا تبدأ البناء قبل تكوين صورة موثوقة عن الحالة الحالية.

### 3. افحص توافق AJM ↔ UX ↔ PJ قبل التنفيذ
لكل capability/workflow:

`AJM contract → PJ ownership/impact → UX/IA surface → entitlement/authorization → canonical data owner → runtime workflow`

تحقق خصوصًا من عدم وجود:
- duplicate workflow؛
- duplicate source of truth؛
- UX surface يخالف AJM؛
- تنفيذ PJ يخالف AJM؛
- authorization لا يطابق visibility؛
- Domain/Module/Feature/Capability/Skill/Qualification مستخدمة بمعنى خاطئ.

إذا وجدت خطأ يمكن إصلاحه دون قرار مني، أصلحه ولا تتوقف.

### 4. التنفيذ
استخدم:

`Inspect → Reuse → Extend → Create only when genuinely required.`

نفّذ العمل كاملًا داخل GitHub/Codespaces وSupabase وأدوات البرمجة والاختبار والتدقيق المتاحة.

لا تعيد بناء شيء موجود وصحيح.
لا تترك أخطاء أو TODOs قابلة للحل.
لا تتوقف بسبب مشكلة مرحلية يمكن حلها بالتشخيص والإصلاح.

### 5. Validation
بعد التنفيذ، نفّذ كل التحققات المناسبة، ومنها:
- TypeScript/typecheck
- lint/static analysis
- unit/integration tests
- build
- migration validation
- schema/data integrity
- RLS and tenant isolation
- authentication/authorization
- entitlement/license behavior
- authenticated runtime
- critical E2E workflow
- UX/IA visibility/discoverability
- Arabic/English/i18n
- responsive/mobile
- loading/empty/error states
- PJ workflow integrity
- cross-domain behavior

لا تعتبر الوثيقة أو الكود وحدهما دليل نجاح.

### 6. Vercel
اقتصِد في Production deployments.

استخدم GitHub/Codespaces/CI/Supabase والفحوص المحلية لاكتشاف وإصلاح الأخطاء الرخيصة أولًا.

لا تستخدم Production deployment كاختبار أولي.

لكن لا تقلل مستوى التدقيق بسبب الاقتصاد.

عندما يصبح Stage Production Candidate فقط، نفّذ Production deployment ثم تحقق من الإنتاج فعليًا.

### 7. Definition of Done
لا تغلق [STAGE] إلا إذا:
- التنفيذ مكتمل؛
- AJM/UX/PJ متوافقة؛
- DB/RLS/Auth/Entitlements صحيحة؛
- workflow الفعلي يعمل؛
- الاختبارات والفحوص ناجحة؛
- build ناجح؛
- Production deployment ناجح؛
- Production verification ناجح؛
- التوثيق محدث؛
- evidence محفوظ؛
- لا توجد مشكلة معروفة قابلة للحل متروكة.

### 8. في حالة blocker حقيقي
إذا تعذر Production closure بسبب عامل خارجي حقيقي لا يمكن حله في نطاق التنفيذ:
- لا تخفِ المشكلة؛
- أصلح كل ما يمكن إصلاحه؛
- سجل blocker بدقة؛
- سجل آخر SHA صالح؛
- سجل ما تبقى؛
- أنشئ continuation marker / actionable TODO / issue؛
- اجعل الحالة PARTIALLY CLOSED / BLOCKED فقط؛
- وانتقل إلى Stage تالٍ فقط إذا لم توجد dependency تمنع ذلك.

### 9. التوثيق
وثّق كل ما تم:
- findings؛
- decisions؛
- changes؛
- migrations؛
- tests؛
- defects/fixes؛
- runtime evidence؛
- deployment evidence؛
- closure state.

لا تعدّل التاريخ لإخفاء أن العمل كان غير مكتمل سابقًا.

### 10. القرار النهائي
في نهاية التنفيذ قدم تقريرًا تنفيذيًا مختصرًا ودقيقًا يوضح:
1. الحالة قبل التنفيذ.
2. ما تم اكتشافه.
3. ما تم إصلاحه/تنفيذه.
4. ما تم التحقق منه.
5. Production deployment ونتيجة التحقق إن وجد.
6. حالة [STAGE]: CLOSED أو PARTIALLY CLOSED / BLOCKED.
7. ما يجب أن يبدأ بعده مباشرة.

**لا تتوقف عند إعداد خطة فقط. نفّذ. ولا تطلب قرارًا مني إلا إذا واجهت قرارًا معماريًا/منتجيًا جديدًا لا تحكمه الوثائق أو القرارات المعتمدة.**

---

## Stage selection

Replace `[STAGE]` with exactly one of:

`AJM-0`, `AJM-1`, `AJM-2`, `AJM-3`, `AJM-4`, `AJM-5`, `AJM-6`, `AJM-7`, `AJM-8`.
