# CORE SYSTEM — AJM FULL EXECUTION PROMPT
## AJM-0 → AJM-8 → Final Production Closure

**Date:** 2026-08-29  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Production branch:** `main`

---

# EXECUTION MANDATE

أنت منفذ هندسي تنفيذي لمشروع CORE SYSTEM. المطلوب ليس إعداد خطة أو تقرير فقط، بل **تنفيذ AJM-0 → AJM-8 بالكامل وبالتسلسل حتى Final Production Closure**.

قبل بدء التنفيذ اقرأ من المستودع، من الحالة الفعلية الحالية، وليس من ذاكرة المحادثات:

1. `docs/AJM-EXECUTION-HANDOFF-2026-08-29.md`
2. `docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md`
3. `docs/PJ-AJM-UX-DEEP-RECONCILIATION-2026-08-29.md`
4. `docs/CORE-SYSTEM-TERMINOLOGY-GLOSSARY-2026-08-29.md`
5. `docs/TERMINOLOGY-APPLICATION-REGISTER-2026-08-29.md`
6. جميع وثائق AJM المرتبطة بكل Stage.
7. وثائق UX/IA الحاكمة والوثائق ذات الصلة.
8. وثائق PJ ذات الصلة.
9. وثائق/سجلات التنفيذ التاريخية ذات الصلة عند الحاجة.

ثم افحص GitHub `main`، الفروع ذات الصلة، الكود، الاختبارات، migrations، Supabase، والواجهات الفعلية.

---

# 0. FUNDAMENTAL RULES

## 0.1 Acceptance reset

عامل جميع AJM stages، من AJM-0 إلى AJM-8، على أنها **UNEXECUTED لأغراض القبول الحالي** حتى يثبت التنفيذ والاختبار والإغلاق وفق هذا العقد.

وجود implementation سابق، أو commit، أو وثيقة تقول CLOSED، هو **evidence** وليس قبولًا حاليًا.

لا تحذف العمل السابق لمجرد أنه تاريخي. افحصه وصنفه:

`KEEP / CLARIFY / RENAME / RECONCILE / SUPERSEDE / HISTORICAL`

## 0.2 No memory execution

لا تعتمد على ذاكرة المحادثات السابقة كحقيقة تنفيذية. الحقيقة هي الحالة الحالية للمستودع وSupabase والـruntime والأدلة الموجودة في GitHub.

## 0.3 No unnecessary stopping

إذا وجدت مشكلة قابلة للحل دون قرار معماري/منتجي جديد:

`Diagnose → Fix → Test → Re-check → Document`

ولا تتوقف لطلب الإذن.

## 0.4 No invention

لا تخترع:
- architecture boundary؛
- permission؛
- entitlement؛
- database source of truth؛
- environment secret؛
- UX surface؛
- external integration؛
- product decision

إذا كانت غير موجودة في القرارات الحاكمة ولا يمكن استنتاجها بأمان.

إذا كان القرار ضروريًا فعلًا وغير محسوم، أوقف **بوابة القرار المحددة فقط** وسجل السبب بدل التخمين.

---

# 1. GOVERNING RELATIONSHIP: AJM ↔ UX ↔ PJ

لكل capability أو workflow نفذ هذا التسلسل:

`AJM contract → PJ ownership/impact → UX/IA surface → entitlement/authorization → canonical data owner → runtime workflow → evidence → production verification → closure`

## PJ

PJ يملك رحلة المريض ومعانيها وسياقها patient-centered/clinical journey.

## AJM

AJM يوفر القدرات الإدارية والتشغيلية والتنسيقية اللازمة لتشغيل العيادة، دون إنشاء نسخة موازية من ملكية PJ.

## UX/IA

UX/IA تحدد كيف تظهر القدرة وكيف يستخدمها المستخدم. الظهور ليس تفويضًا أمنيًا.

`Workspace` بيئة عمل، وليس authorization boundary.

---

# 2. TERMINOLOGY GATE

استخدم القاموس المعتمد قبل أي تسمية أو إعادة تسمية.

القواعد الحاكمة:

- `Domain != Module`
- `Module != Feature`
- `Capability != Skill != Qualification`
- `Permission != Entitlement != Capability`
- `Appointment != Visit`
- CORE يستخدم `Visit` داخليًا، مع `Encounter` كمطابقة معيارية خارجية عند الحاجة.

لا تستخدم global blind rename.

أي استخدام تاريخي مختلف يجب تصنيفه ومعالجته بقرار موثق.

---

# 3. STAGE EXECUTION STATE MACHINE

كل Stage يجب أن يمر بـ:

`UNEXECUTED`
→ `PRECHECK`
→ `RECONCILED`
→ `IMPLEMENTING`
→ `LOCAL/CI VALIDATED`
→ `DB/AUTH VALIDATED`
→ `RUNTIME VALIDATED`
→ `PRODUCTION CANDIDATE`
→ `VERCEL PRODUCTION DEPLOYED`
→ `PRODUCTION VERIFIED`
→ `DOCUMENTATION CLOSED`
→ `CLOSED`

الفشل يعيد المرحلة إلى أول Gate غير صالح.

---

# 4. MANDATORY PRE-STAGE AUDIT

قبل كل Stage، حتى لو كان العمل السابق يبدو مكتملًا:

### Documentation
- اقرأ AJM stage contract/blueprint.
- اقرأ UX authority والوثائق ذات الصلة.
- اقرأ PJ documents ذات الصلة.
- اقرأ relevant historical records.

### GitHub
- افحص `main`.
- افحص branches ذات الصلة.
- قارن branches قبل porting.
- افحص changed files.
- لا تدمج branch قديمًا wholesale.

### Code
- routes/pages
- components
- domains
- services
- authorization
- entitlements
- tests
- feature flags
- navigation
- i18n
- mobile/responsive behavior

### Supabase
- schema
- tables
- columns
- constraints
- indexes
- functions
- triggers
- RLS
- policies
- tenant isolation
- live data invariants
- migration history

### Runtime
- canonical user surface
- authenticated behavior
- unauthorized behavior
- empty/loading/error states
- critical workflow

لا تبدأ التنفيذ قبل معرفة ما هو موجود ويمكن إعادة استخدامه.

---

# 5. IMPLEMENTATION PRINCIPLE

طبّق:

`Inspect → Reuse → Extend → Create only when genuinely required.`

إذا كان implementation موجودًا وصحيحًا ومتوافقًا، أعد استخدامه.
إذا كان صحيحًا جزئيًا، أصلحه/وسّعه.
إذا كان متعارضًا، reconcile قبل الإضافة.
لا تبنِ duplicate system لمجرد أن AJM stage يحتاج capability.

---

# 6. PJ IMPACT GATE

قبل كل تغيير مؤثر في workflow اسأل عمليًا:

1. أين يقع داخل رحلة المريض؟
2. من يملك الحالة؟
3. من يملك البيانات؟
4. من ينفذ الإجراء؟
5. هل AJM ينسق العمل أم يعيد إنشاء domain lifecycle؟
6. هل UX يعرض capability أم يخلق workflow جديدًا؟
7. هل هناك source of truth ثانٍ؟
8. هل هناك duplicate task/follow-up/communication/appointment/treatment flow؟

لا تسمح بتنفيذ يخلق رحلة مريض موازية.

---

# 7. PER-STAGE VALIDATION

لكل Stage، حيثما ينطبق:

- TypeScript/typecheck
- lint/static analysis
- unit tests
- integration tests
- build
- migration validation
- schema integrity
- data integrity
- RLS
- tenant isolation
- authentication
- authorization
- effective permissions
- entitlement/license behavior
- authenticated runtime
- critical E2E
- UX/IA visibility
- discoverability
- Arabic/English parity
- i18n
- responsive/mobile
- loading/empty/error states
- PJ workflow integrity
- cross-domain integration
- auditability

لا تعتبر route/component أو table أو document وحدها دليل قبول.

---

# 8. VERCEL ECONOMY + PRODUCTION GATE

Vercel Production ليس بيئة debugging أولية.

قبل Production deployment استخدم:

- Codespaces/local checks
- GitHub Actions
- static analysis
- tests
- build
- Supabase validation
- authenticated test methods المتاحة

أصلح الأخطاء قبل استهلاك Production deployment.

لكن **لا تخفض مستوى التحقق** من أجل الاقتصاد.

Preview deployment التلقائي لا يساوي Production acceptance.

عندما يصبح candidate صالحًا فقط، نفذ Production deployment.

يجب أن يكون SHA الذي تم اختباره هو SHA المرشح للنشر، متى كان ذلك مطلوبًا من Definition of Done.

بعد deployment نفذ Production verification فعليًا.

---

# 9. STAGE ORDER AND NON-SKIP RULE

نفذ بالترتيب:

### AJM-0
Baseline / Governance / Readiness

### AJM-1
Team & Access

### AJM-2
Financial & Resources

### AJM-3
Workforce

### AJM-4
Communications

### AJM-5
Journey Coordination

### AJM-6
Insights

### AJM-7
Cross-Domain Integration

### AJM-8
Final Production Closure

لا تتجاوز Stage لأن implementation لاحقًا موجود بالفعل.

إذا كان Stage لاحقًا يعتمد على Stage سابق، فلا تتجاوزه عند وجود dependency حقيقية.

إذا كان blocker خارجي حقيقي يمنع closure، اتبع Blocker Protocol أدناه.

---

# 10. STAGE-SPECIFIC WORKFLOW

## AJM-0 — Baseline / Governance / Readiness

- establish current source of truth;
- verify repository/branch state;
- verify governing documents;
- verify terminology governance;
- reconcile AJM/UX/PJ;
- identify stale/historical artifacts;
- establish evidence structure;
- validate baseline build/tests/security state;
- document readiness.

لا يعتبر CLOSED إلا وفق هذا البروتوكول، حتى لو كان تاريخيًا CLOSED.

## AJM-1 — Team & Access

تحقق فعليًا من:
- Clinic Admin access;
- role creation;
- permission assignment;
- direct overrides;
- explicit revoke;
- unauthorized denial;
- tenant isolation;
- Sidebar visibility from effective permissions;
- Workspace visibility from effective permissions;
- Arabic/English;
- mobile.

لا تجعل visibility بديلًا عن authorization.

## AJM-2 — Financial & Resources

تحقق من canonical surfaces:
- Overview
- Invoices
- Payments
- Financial Plans
- Installments
- Insurance
- Claims
- Inventory
- Consumption
- Purchasing
- Suppliers
- Receiving

تحقق من permissions/entitlements، persistence، relationships، auditability، patient context، Portal relationship عند انطباقه، Analytics consumption، i18n/mobile، وعدم وجود duplicate hierarchy.

## AJM-3 — Workforce

- staff ownership;
- availability;
- leave;
- attendance;
- payroll;
- capacity;
- authorization;
- tenant isolation;
- UX surfaces;
- Arabic/English;
- mobile.

Workforce مستقل عن Agenda وJourney Coordination.

## AJM-4 — Communications

نفذ/reconcile communications capability دون إنشاء workflow engine موازٍ.

إذا كان الاتصال يحتاج إلى action/work item، راجع ownership مع Journey Coordination.

## AJM-5 — Journey Coordination

ابنِ/أكمل General Work layer عند الحاجة لـ:
- Tasks
- Requests
- Handoffs
- Next Actions
- Escalation

لكن لا تنشئ نسخة ثانية من:
- Patient Journey
- Agenda
- Workforce
- Communications
- Follow-up
- Treatment Plan

القاعدة:

`Existing domain event → required work → authorized actor → execute → close → insight`

## AJM-6 — Insights

استهلك canonical domain data.

لا تنشئ source of truth مالية/تشغيلية/سريرية موازية.

تحقق من authorization وtenant isolation والـUX والـruntime.

## AJM-7 — Cross-Domain Integration

اختبر workflows كاملة عبر:
- patient context
- appointment/visit
- treatment
- financial commitments
- resources
- workforce
- operational work
- follow-up
- communication
- portal
- insights

اختبرها كـclinic workflow حقيقي وليس كـAPI calls منفصلة.

## AJM-8 — Final Production Closure

نفذ final audit شامل:
- security
- privacy
- tenant isolation
- authorization
- entitlements
- data integrity
- migrations
- auditability
- runtime
- UX/IA
- PJ integrity
- documentation
- deployment

ثم Production verification النهائي.

---

# 11. PER-STAGE RECONCILIATION MATRIX

لكل capability سجل:

| Item | Evidence required |
|---|---|
| AJM contract | current stage document |
| PJ impact | relevant PJ authority + workflow mapping |
| UX surface | canonical route/navigation/workspace |
| Permission | permission key + server enforcement |
| Entitlement | applicable capability/license mapping |
| Data owner | canonical tables/functions/RLS |
| Existing implementation | inspected files/commits |
| Duplicate check | explicit result |
| Runtime | authenticated workflow evidence |
| i18n | Arabic/English evidence |
| Mobile | responsive evidence |
| Tests | command + result |
| Build | exact result |
| Production | deployment ID/SHA + verification |
| Documentation | updated stage record |
| Closure | explicit state |

---

# 12. BRANCH / PR RULES

For any historical branch:

`compare → inspect changed files → identify unique intent → port required delta only → validate on current main`

لا تستخدم branch name كدليل صحة.

لا تدمج stale branch wholesale.

كل تغيير يجب أن يكون قابلًا للتدقيق.

---

# 13. BLOCKER PROTOCOL

### Solvable blocker
لا تتوقف.

شخّص وأصلح واختبر ووثّق.

### Genuine external blocker
إذا كان Production closure مستحيلًا فعلًا بسبب dependency خارج نطاق التنفيذ:

1. أصلح كل ما يمكن إصلاحه.
2. سجل blocker بدقة.
3. سجل impact.
4. سجل آخر valid SHA.
5. سجل remaining work.
6. سجل exact next action.
7. أنشئ actionable TODO/Issue/continuation marker.
8. الحالة تصبح:

`PARTIALLY CLOSED / BLOCKED`

9. انتقل إلى Stage تالٍ فقط إذا لم توجد dependency تمنع ذلك.

لا تستخدم blocker status لتجنب عمل قابل للتنفيذ.

---

# 14. DECISION GATE

لا تطلب قرار المستخدم إلا إذا:

- يوجد تعارض معماري حقيقي غير محسوم؛ أو
- يوجد product decision جديد؛ أو
- يوجد ownership decision لا يمكن استنتاجه من القرارات المعتمدة؛ أو
- يوجد خطر غير قابل للحل بأمان دون موافقة.

قبل السؤال، قدم:
- facts;
- conflicting rules;
- affected workflows;
- options;
- impact;
- recommendation إن كان مسموحًا؛
- exact decision needed.

لا تسأل عن الأمور التنفيذية العادية.

---

# 15. DOCUMENTATION PROTOCOL

لا تنتظر نهاية AJM.

لكل Stage وثّق:

- pre-stage state;
- findings;
- AJM/UX/PJ reconciliation;
- architecture implications;
- changes;
- migrations;
- tests;
- defects;
- fixes;
- runtime evidence;
- production evidence;
- deployment SHA/ID;
- final state;
- unresolved items;
- next action.

لا تعيد كتابة التاريخ لإخفاء النواقص السابقة.

---

# 16. FINAL PRODUCTION CLOSURE

بعد AJM-8، لا تعلن المشروع مغلقًا بمجرد نجاح build.

يجب أن يكون:

`Implementation complete`
+ `AJM/UX/PJ reconciled`
+ `DB/RLS/Auth/Entitlement validated`
+ `Critical workflows validated`
+ `Build passed`
+ `Production deployed`
+ `Production verified`
+ `Documentation complete`
+ `Evidence complete`

ثم فقط:

**FINAL PRODUCTION CLOSURE**

---

# 17. FINAL REPORT

في نهاية التنفيذ قدم تقريرًا تنفيذيًا يوضح لكل Stage:

- الحالة عند البداية؛
- ما تم فحصه؛
- ما تم اكتشافه؛
- ما تم إصلاحه؛
- ما تم تنفيذه؛
- validation results؛
- deployment result؛
- evidence location؛
- closure state؛
- blockers إن وجدت؛
- next stage.

ثم قدم:

**AJM Global Status**

و:

**Final Production Closure Status**

ولا تستخدم كلمة `CLOSED` لأي Stage إلا إذا استوفى هذا العقد.

---

# 18. FINAL NON-NEGOTIABLE OBJECTIVE

الهدف ليس إنتاج كود أكثر.

الهدف هو أن يصبح CORE SYSTEM نظام تشغيل عيادة متماسكًا بحيث:

**AJM + UX/IA + PJ + Authorization + Entitlements + Data Ownership + Runtime Workflow**

تعمل معًا دون تعارض أو duplicate ownership، ويستطيع فريق العيادة تنفيذ رحلة المريض الداخلية والكاملة فعليًا، ثم تتم إدارة ذلك التشغيل وقياسه في Production بثقة عالية.

**ابدأ من AJM-0، نفذ بالتسلسل، لا تتوقف عند المشاكل القابلة للحل، ولا تعلن الإغلاق قبل Production verification.**
