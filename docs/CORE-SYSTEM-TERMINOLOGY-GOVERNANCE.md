# CORE SYSTEM — Terminology Governance

**Version:** 1.0.0  
**Date:** 2026-08-29  
**Status:** AUTHORITATIVE — terminology baseline for architecture, AJM, UX/IA and future implementation  
**Scope:** Business architecture, product structure, authorization, workforce, UX/IA, Patient Journey (PJ), AJM and implementation documentation.

> This document resolves terminology ambiguity. It does not silently rewrite historical decisions. Historical documents remain evidence of project evolution and are corrected only where the reconciliation register identifies a real current-state conflict.

## 1. Governing rules

1. A term must represent one stable concept in current CORE SYSTEM architecture.
2. Similar words are not treated as synonyms merely because they are commonly interchangeable in English.
3. Historical wording is interpreted by context before it is changed.
4. Current authoritative decisions take precedence over older terminology when the same concept is intended.
5. A historical decision is marked **Superseded** only when a later decision explicitly changes the concept; otherwise it is **Reconciled/Clarified**.
6. UX surface terms do not redefine business ownership.
7. Authorization terms do not redefine business capabilities.
8. Medical-standard mappings (for example, FHIR terminology) are mappings, not automatic replacements for CORE user-facing terminology.

## 2. Core architecture vocabulary

| English | العربية | CORE SYSTEM meaning | Must NOT be confused with |
|---|---|---|---|
| **Domain** | **مجال أعمال / مجال مسؤولية** | A bounded area of business responsibility with defined ownership of business rules, authoritative records and integration boundaries. | Module, Workspace, Feature |
| **Module** | **وحدة وظيفية / وحدة منتج** | A coherent product/functional unit that can be exposed, configured, licensed, permission-controlled and activated as an independent product capability where applicable. | Domain, Page, Widget |
| **Feature** | **وظيفة / ميزة** | A specific user or system functionality delivered within a module or broader capability. | Module, Permission, Feature Flag |
| **Capability** | **قدرة** | A capability provided by the platform/product or made available to a tenant/user context. In authorization context it describes what the system can make available; it does not mean a person's skill. | Skill, Qualification, Permission, Entitlement |
| **Skill** | **مهارة** | A human ability or learned competence relevant to an employee's work. | Capability, Qualification, Role |
| **Qualification** | **مؤهل** | A formal credential, certification, license, degree or other recognized qualification held by a person. | Skill, Role, Permission |
| **Entitlement** | **استحقاق / أهلية استخدام** | The tenant/user-level right to have access to a licensed or included capability according to subscription/license rules. | Permission, Role, Feature |
| **Permission** | **صلاحية** | An authorization grant describing an allowed action or access within the system. | Capability, Role, Entitlement |
| **Role** | **دور وظيفي/تنظيمي** | An organizational label and configurable starting permission template. The role name does not itself determine authorization. | Permission, Skill, Job Position |
| **Workspace** | **مساحة عمل** | A user's working interface organized around the work they perform. It is a UX surface, not a security boundary and not a Domain. | Domain, Dashboard, Permission boundary |
| **Widget** | **مكوّن واجهة / عنصر عمل** | A focused information, action or attention surface used inside supported UX surfaces. It never grants permission. | Module, Domain, Workspace |
| **Quick Action** | **إجراء سريع** | A focused shortcut to an authorized action that may exist without a full Widget. | Permission, Feature |
| **Feature Flag** | **علامة تفعيل** | A technical/product control used to enable or disable behavior or rollout. It is not itself a product feature or authorization grant. | Feature, Permission, Entitlement |

## 3. Operational and clinical vocabulary

| English | العربية | CORE SYSTEM meaning |
|---|---|---|
| **Patient** | المريض | The person receiving care and the central subject of the Patient Journey. |
| **Appointment** | الموعد | A planned/scheduled booking for a future or intended interaction. |
| **Visit** | الزيارة | CORE's canonical user-facing term for the actual patient visit/work session occurring in the clinic. |
| **Encounter** | المقابلة/التفاعل الصحي | External/standard medical terminology, especially for interoperability. CORE does not replace Visit with Encounter in the user-facing model solely because standards use Encounter. |
| **Patient Flow** | مسار حركة المريض | The operational system representing the patient's movement through the clinic; it is one system with Operations, Clinical and Administrative views. |
| **Queue** | قائمة الانتظار | A mechanism within Patient Flow for managing waiting/order/movement; it is not a replacement for Patient Flow. |
| **Treatment Plan** | خطة العلاج | CORE's patient-care planning concept describing intended treatment work and its progression. External mappings such as FHIR CarePlan are interoperability mappings, not automatic renaming. |
| **Procedure** | إجراء طبي | A medically defined procedure, anchored to the Medical Master Library where applicable. |
| **Service** | خدمة | A clinic-facing service entity distinct from a Procedure; a Service may bundle multiple Procedures. |
| **Patient Journey (PJ)** | رحلة المريض | The end-to-end patient-centered business journey and its authoritative patient-care behavior. |

## 4. Work-management vocabulary

| English | العربية | CORE SYSTEM meaning |
|---|---|---|
| **Task** | مهمة | A defined piece of work assigned or actionable by a user/team. |
| **Request** | طلب | A request for an action, decision, service or intervention that may enter a workflow. |
| **Work Item** | عنصر عمل | A generic workflow object representing something that needs processing; use only when the specific type is intentionally abstract. |
| **Next Action** | الإجراء التالي | The next intended actionable step in a workflow or journey. It is not necessarily a stored Task. |
| **Handoff** | إحالة/تسليم عمل | Transfer of responsibility/context from one actor or work area to another. |
| **State** | حالة | The underlying condition in a lifecycle/state machine. |
| **Status** | حالة عرض/وضع | The operational or user-facing status label presented for an object. Status may be derived from or reflect state, but the terms are not automatically interchangeable. |

## 5. Required conceptual separation

### 5.1 Domain vs Module

**Domain answers:** Who owns the business responsibility, rules and authoritative records?  
**Module answers:** What coherent product/functional unit can be offered, configured, licensed, permission-controlled or activated?

Therefore:

> **Domain ≠ Module.**

The relationship between Domains and Modules is not assumed to be a simple one-to-one hierarchy. A future architecture decision may define whether a Module belongs to one Domain, crosses multiple Domains through integration, or is a product surface over capabilities owned by several Domains.

### 5.2 Module vs Feature

A Module can contain multiple Features. A Feature can be a small user/system functionality without being an independently licensable or navigational Module.

> **Module ≠ Feature.**

A page, route, widget or database table is not automatically a Feature or Module.

### 5.3 Capability vs Skill vs Qualification

- **Capability:** what the platform/business can provide or make available.
- **Skill:** what a person can competently do.
- **Qualification:** formal evidence/credential that a person holds.

> **Capability ≠ Skill ≠ Qualification.**

A person may have a Skill supported by a Qualification; the platform may have a Capability that uses that Skill. These relationships must not collapse the concepts into one field or label.

### 5.4 Entitlement vs Permission

- **Entitlement:** whether a tenant/user is eligible to have/use a licensed capability.
- **Permission:** whether an authorized user may perform a specific action/access.

A capability may require both entitlement and permission before it is usable.

### 5.5 Role vs Permission

Role is an organizational/configuration concept. Permission is authorization. Role templates can seed permissions but do not replace the permission model.

### 5.6 Workspace vs authorization

Workspace organizes work. Authorization determines what the user can access/do. Workspace must never become an alternate security boundary.

## 6. Historical terminology policy

The project contains older documents in which Module, Capability, Feature, Skill and related terms were used more broadly. Those documents are not rewritten by blind find/replace.

Every historical occurrence must be classified as one of:

- **KEEP** — current meaning is already correct.
- **CLARIFY** — concept is correct; wording needs a definition.
- **RENAME** — the intended concept is clear but the term is wrong under the current glossary.
- **RECONCILE** — the old decision and current decision describe related but different layers.
- **SUPERSEDE** — a later explicit architectural decision changed the concept.
- **HISTORICAL** — retain unchanged as historical evidence; do not use as current authority.

## 7. Visit / Encounter rule

CORE user-facing workflow uses **Visit** as the canonical term. **Encounter** remains a standard/interoperability mapping term when integrating with medical standards such as HL7 FHIR.

The distinction is intentional:

`Appointment` = planned booking  
`Visit` = actual clinic visit in CORE  
`Encounter` = external/standard medical mapping where applicable

## 8. Treatment Plan / CarePlan rule

CORE retains **Treatment Plan** as the user-facing and product concept. External standards may map it to concepts such as FHIR **CarePlan** when interoperability requires it. The mapping does not create a second user-facing CORE concept unless a future explicit architecture decision requires one.

## 9. Enforcement rule for future documentation

New architecture, AJM, UX/IA, PJ and implementation documents must use this glossary. If a new document needs a different meaning for an existing term, it must explicitly propose a terminology change rather than silently redefining the term.
