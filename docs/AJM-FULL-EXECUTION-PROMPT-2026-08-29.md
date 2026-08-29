# CORE SYSTEM — AJM FULL EXECUTION PROMPT
## AJM-0 → AJM-8 → Final Production Closure

**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Production branch:** `main`  
**Date:** 2026-08-29

## 1. EXECUTION MANDATE
نفّذ AJM-0 → AJM-8 بالكامل وبالتسلسل حتى Final Production Closure. هذه مهمة تنفيذ فعلية وليست إعداد خطة فقط.

ابدأ بقراءة:
- `docs/AJM-EXECUTION-HANDOFF-2026-08-29.md`
- `docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md`
- `docs/PJ-AJM-UX-DEEP-RECONCILIATION-2026-08-29.md`
- `docs/CORE-SYSTEM-TERMINOLOGY-GLOSSARY-2026-08-29.md`
- `docs/TERMINOLOGY-APPLICATION-REGISTER-2026-08-29.md`
- جميع وثائق AJM وUX/PJ المرتبطة بكل Stage.

ثم افحص الحالة الفعلية في GitHub وSupabase والكود والاختبارات والـruntime. لا تعتمد على ذاكرة المحادثات.

## 2. ACCEPTANCE RESET
اعتبر كل AJM Stage `UNEXECUTED` لأغراض القبول الحالي، حتى لو كان هناك تنفيذ تاريخي أو وثيقة CLOSED.

العمل التاريخي دليل يجب فحصه، وتصنيفه:
`KEEP / CLARIFY / RENAME / RECONCILE / SUPERSEDE / HISTORICAL`.

لا تعِد بناء شيء صحيح لمجرد أنه تاريخي.

## 3. ARCHITECTURAL AUTHORITY
- PJ يملك patient journey semantics والـpatient/clinical journey ownership.
- AJM يملك administrative/operational capabilities وcross-domain coordination دون نسخ ملكية PJ.
- UX/IA تحدد presentation/interaction؛ الظهور ليس authorization.
- Workspace ليس authorization boundary.
- `Domain != Module != Feature`.
- `Capability != Skill != Qualification`.
- `Permission != Entitlement != Capability`.
- `Appointment != Visit`؛ CORE يستخدم Visit داخليًا، وEncounter mapping عند الحاجة.

لا تخترع ownership أو source of truth أو permission أو entitlement أو workflow جديدًا إذا كان القرار غير محسوم.

## 4. MANDATORY AJM ↔ UX ↔ PJ GATE
قبل كل تغيير:
`AJM contract → PJ ownership/impact → UX/IA surface → entitlement/authorization → canonical data owner → runtime workflow`.

تحقق من عدم وجود:
- duplicate workflow؛
- duplicate source of truth؛
- duplicate Patient Journey؛
- UX visibility لا تطابق effective permissions؛
- AJM يعيد إنشاء lifecycle يملكه PJ؛
- naming يخالف terminology governance.

## 5. PRE-STAGE AUDIT
لكل Stage افحص قبل التنفيذ:
- AJM documents؛
- UX/IA authority؛
- PJ documents؛
- historical branches/commits؛
- `main`؛
- routes/components/services/domains؛
- navigation/feature flags/i18n؛
- tests/build/CI؛
- Supabase schema, migrations, constraints, indexes, functions, triggers, RLS, policies, tenant isolation, live invariants؛
- authenticated and unauthorized runtime behavior.

لا تعتبر الوثائق وحدها أو وجود الكود دليلًا على النجاح.

## 6. IMPLEMENTATION RULE
استخدم:
`Inspect → Reuse → Extend → Create only when genuinely required`.

إذا كانت المشكلة قابلة للحل دون قرار جديد:
`Diagnose → Fix → Test → Re-check → Document`.
لا تتوقف لطلب الإذن في الأمور التنفيذية العادية.

## 7. STAGE ORDER
نفّذ بالترتيب:
1. AJM-0 — Baseline / Governance / Readiness
2. AJM-1 — Team & Access
3. AJM-2 — Financial & Resources
4. AJM-3 — Workforce
5. AJM-4 — Communications
6. AJM-5 — Journey Coordination
7. AJM-6 — Insights
8. AJM-7 — Cross-Domain Integration
9. AJM-8 — Final Production Closure

لا تتجاوز Stage بسبب وجود implementation سابق.

## 8. STAGE STATE MACHINE
`UNEXECUTED → PRECHECK → RECONCILED → IMPLEMENTING → LOCAL/CI VALIDATED → DB/AUTH VALIDATED → RUNTIME VALIDATED → PRODUCTION CANDIDATE → PRODUCTION VERIFIED → DOCUMENTATION CLOSED → CLOSED`.

عندما يكون Vercel Production غير متاح بسبب shared build/usage limit، تصبح الحالة بعد نجاح كل البوابات السابقة:
`PRODUCTION CANDIDATE / RELEASE-DEFERRED`.

هذه الحالة ليست CLOSED وليست فشلًا في التنفيذ؛ إنها مرشح جاهز ينتظر بوابة النشر المشتركة.

## 9. SHARED DEFERRED PRODUCTION RELEASE BUNDLE
إذا كان Vercel Production build-rate/usage blocker يمنع النشر:

**لا تتوقف عن AJM.**

استمر في:
- تنفيذ AJM stages بالتسلسل؛
- إصلاح مراحل AJM التاريخية؛
- PJ/UX reconciliation؛
- Supabase implementation/migrations/validation؛
- GitHub Actions؛
- static analysis؛
- typecheck/lint؛
- unit/integration tests؛
- builds؛
- non-production runtime verification؛
- security/RLS/tenant isolation؛
- documentation/evidence.

لا تستهلك Production deployments جزئية.

اجمع كل العمل الناجح في **coherent release candidate** واحد، مع tracking لآخر SHA صالح وكل التغييرات والاختبارات والمigrations والمخاطر.

Issue #56 هو سجل release-bundle لهذا الغرض.
Issue #54 هو Vercel build-rate blocker.
Issue #53 هو authenticated Production E2E identity/session blocker.

### عند زوال Vercel blocker
قبل أول Production deployment:
1. ثبّت release candidate SHA.
2. أعد تشغيل integrated validation على كامل الحزمة.
3. تحقق من migrations/RLS/auth/entitlements.
4. تحقق من AJM + UX + PJ workflows كاملة.
5. تحقق من build النهائي.
6. نفّذ **Production deployment واحدًا للحزمة المتكاملة** قدر الإمكان، وليس deployment لكل Stage.
7. نفّذ Production verification فعليًا.
8. استخدم الأدلة الناتجة لإغلاق المراحل المستوفية.

هذا يؤجل Production gate فقط؛ ولا يلغي شرط Production acceptance.

## 10. VERCEL ECONOMY
لا تستخدم Vercel Production للتجريب أو debugging.

استنفد أولًا Codespaces/local/GitHub Actions/Supabase والفحوص الأرخص.

Preview deployment التلقائي لا يساوي Production acceptance.

الاقتصاد في deployment لا يعني تخفيض جودة الاختبار.

## 11. VALIDATION
لكل Stage، حيث ينطبق:
- typecheck؛
- lint/static checks؛
- unit/integration؛
- build؛
- migration/schema/data integrity؛
- RLS/tenant isolation؛
- authentication/authorization/effective permissions؛
- entitlements؛
- authenticated runtime؛
- critical E2E؛
- UX/IA visibility/discoverability؛
- Arabic/English/i18n؛
- responsive/mobile؛
- loading/empty/error states؛
- PJ workflow integrity؛
- cross-domain integration؛
- auditability.

## 12. AUTHENTICATED PRODUCTION E2E
لا تختلق مستخدمًا أو session أو credential.

إذا لم تتوفر approved Production test identity/session، أكمل كل العمل الممكن، وسجل ذلك كـProduction verification dependency. لا تعتبر Production acceptance مكتملًا بزيارة `/login` أو public page فقط.

## 13. BLOCKER PROTOCOL
### مشكلة قابلة للحل
أصلحها ولا تتوقف.

### External/shared blocker
أكمل كل العمل الممكن وضعه في release candidate.

إذا كان blocker يمنع فقط Production deployment، استخدم:
`PRODUCTION CANDIDATE / RELEASE-DEFERRED`.

إذا كان blocker يمنع حتى implementation/validation الآمن، استخدم:
`PARTIALLY CLOSED / BLOCKED`.

سجل:
- exact blocker؛
- impact؛
- last valid SHA؛
- completed work؛
- remaining work؛
- exact next action؛
- GitHub Issue/continuation marker.

لا تعلن CLOSED اصطناعيًا.

## 14. DECISION GATE
لا تطلب قرار المستخدم إلا عند وجود architectural/product/ownership decision جديد غير محسوم ولا يمكن استنتاجه بأمان.

قبل السؤال اعرض facts + conflict + affected workflow + options + exact decision needed.

## 15. GITHUB / SUPABASE
- اعمل من current `main` وفروع مركزة.
- افحص branches قبل porting.
- لا تدمج stale branch wholesale.
- اجعل commits قابلة للتدقيق.
- اعتبر Supabase جزءًا أساسيًا من التنفيذ.
- تحقق من live schema/RLS/functions/triggers/migrations/data invariants.

## 16. DOCUMENTATION
لكل Stage وثّق:
- baseline؛
- findings؛
- AJM/UX/PJ reconciliation؛
- decisions؛
- implementation؛
- migrations/RLS؛
- tests/build/CI؛
- defects/fixes؛
- runtime evidence؛
- release-candidate SHA؛
- Production deployment/verification عند توفرها؛
- final state؛
- continuation items.

## 17. FINAL CLOSURE
لا تستخدم `CLOSED` إلا بعد:
`Implementation complete + AJM/UX/PJ reconciled + DB/Auth/Entitlements validated + critical workflows validated + build passed + Production deployed + Production verified + documentation/evidence complete`.

بعد AJM-8 نفذ Final Production Audit شاملًا ثم أعلن فقط:
**FINAL PRODUCTION CLOSURE**

## 18. NON-NEGOTIABLE OBJECTIVE
الهدف هو نظام تشغيل عيادة متكامل، وليس مجموعة كودات منفصلة:

`AJM + UX/IA + PJ + Authorization + Entitlements + Data Ownership + Runtime Workflow`

يجب أن تعمل كوحدة واحدة في Production.

**لا تتوقف بسبب Vercel build-rate limit. حوّل العمل إلى Release-Deferred Candidate، وواصل التنفيذ حتى نهاية AJM-8 بكل ما يمكن إنجازه بأمان، ثم نفّذ Production gate للحزمة المتكاملة عندما يصبح ذلك ممكنًا.**
