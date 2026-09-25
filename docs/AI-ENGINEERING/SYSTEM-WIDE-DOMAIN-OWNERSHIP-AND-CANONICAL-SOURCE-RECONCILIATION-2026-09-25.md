# CORE SYSTEM — System-Wide Domain Ownership & Canonical Source Reconciliation

Status: ACTIVE ENGINEERING BASELINE — RECONCILIATION IN PROGRESS
Date: 2026-09-25
Owner: AI Engineering Leader / CTO
Scope: Entire CORE SYSTEM, excluding no domain merely because CSAPI is currently active

## 1. Purpose

This document establishes the system-wide engineering ownership map required before starting another domain workstream.

It is not a new product architecture. It reconciles approved architecture with the repository and live Supabase reality and records where executable evidence is still required.

The governing rule is:

Architecture → Domain Owner → Canonical Source → Canonical Execution Path → Repository → Database → Authorization → Runtime Evidence → Documentation

A domain is not considered closed merely because a table, page, function, or document exists.

## 2. Evidence inspected

Repository / architecture evidence:
- CORE_SYSTEM_INDEX.md
- ENGINEERING_CONSTITUTION.md
- ARCHITECTURE_DECISIONS.md
- PROJECT_HANDOFF.md
- docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md
- docs/CORE-SYSTEM-REMEDIATION-HANDOFF-2026-09-03.md
- docs/IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md
- docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md
- docs/ADR-008-FINANCIAL-INVENTORY-CROSS-DOMAIN-ARCHITECTURE-2026-09-04.md
- docs/ADR-014-FOLLOW-UP-COMMUNICATIONS-COORDINATION-BOUNDARIES.md
- current AI Engineering governance documents

Live Supabase evidence on 2026-09-25:
- 5 tenants
- 396 clinic patients
- 139 visit sessions
- 342 agenda events
- 825 retention follow-ups
- 17 operational work items
- 126 public tables
- 277 public functions
- 131 triggers
- 278 RLS policies
- all observed public tables have RLS enabled
- live migration history is materially ahead/different from the repository migration set and therefore requires separate migration-lineage reconciliation
- Supabase security advisor currently reports SECURITY DEFINER functions callable by authenticated users and leaked-password protection disabled; these are recorded findings, not silently converted into product ownership decisions

## 3. Canonical domain ownership map

| Domain / responsibility | Canonical owner | Canonical source / state | Main integration consumers | Current status |
|---|---|---|---|---|
| Platform tenant identity | Tenant / Platform Administration | master_tenants | all tenant-scoped domains | BASELINE ESTABLISHED; runtime/repo reconciliation required |
| Authentication | Auth / Platform Security | Supabase Auth + clinic_users integration | Team & Access, all authenticated surfaces | ESTABLISHED; security verification required |
| Authorization / permissions | Team & Access / Authorization | roles, permissions, role_permissions, role templates, user permissions/overrides + entitlement boundary | every protected domain | ESTABLISHED; duplicate-path audit required |
| Subscription / entitlement | Subscription & Entitlement | subscriptions, subscription_plans, entitlements, entitlement_capabilities, tenant_entitlements | authorization/capability gating | ESTABLISHED; end-to-end canonical path must be proven |
| User workspace context | Workspace / UX Platform | clinic_user_workspaces + approved workspace architecture | global shell, workspace surfaces | ESTABLISHED; runtime ownership audit required |
| Patient registration / identity | Patient / Identity | clinic_patients, patient_identities, patient_identity_identifiers, match audit | visit, portal, communications, journey | ESTABLISHED; identity execution path requires reconciliation |
| Patient-clinic relationship | Patient / Tenant Relationship | patient_clinic_relationships | tenant isolation, patient access | ESTABLISHED; security verification required |
| Medical master definitions | Medical Master Library | approved medical master entities / procedure master architecture | service catalog, clinical, inventory, agenda | ARCHITECTURALLY ESTABLISHED; repository/runtime mapping required |
| Clinic service/procedure catalog | Clinic Service Catalog | clinic_procedures, clinic_services, clinic_service_procedures | commercial, agenda, visit, inventory | CANONICAL TABLE IDENTIFIED; execution-path audit required |
| Commercial offers/packages | Commercial / Sales | clinic_offers, clinic_packages, clinic_package_items | financial, patient packages, journey | CANONICAL TABLES IDENTIFIED; cross-domain execution audit required |
| Patient packages / consumption | Patient Commercial/Entitlement Consumption | patient_packages, patient_package_consumptions | visits, financial, treatment | CANONICAL STATE IDENTIFIED; reconciliation required |
| Appointment / scheduling | Agenda | master_agenda_events | workforce availability, visit, patient journey | CANONICAL ENGINE IDENTIFIED; must remain sole appointment scheduler |
| Provider availability / room conflicts | Agenda + Workforce/Resource integration | clinic_provider_availability + agenda events + resource/room constraints | agenda | OWNERSHIP SPLIT MUST BE EXPLICIT; no second scheduler |
| Patient Flow / clinic-day state | Patient Flow / Visit Operations | patient_flow_queue_entries, patient_flow_events, clinic_visit_sessions | reception, clinical, agenda, coordination | CANONICAL WORKFLOW AUTHORITY; CSAPI implementation must remain subordinate to this boundary |
| Clinical work | Clinical / Visit | clinic_visit_sessions, clinical_work_sessions, visit procedures | treatment plan, medical files, follow-up | CANONICAL STATE IDENTIFIED; live clinical_work_sessions currently 0 requires runtime audit |
| Treatment Plan | Clinical / Patient Journey | clinic_treatment_plans, clinic_treatment_plan_items, clinic_treatment_plan_visits | visit, coordination, financial, follow-up | CANONICAL OWNER IDENTIFIED |
| Follow-up / retention | Follow-up | retention_followups, followup_automation_rules | notifications, coordination, patient journey | CANONICAL OWNER IDENTIFIED; must not become notification or coordination source of truth |
| Journey Coordination | Coordination | operational_work_items, operational_work_history | source domains, Work Center | CANONICAL COORDINATION STATE; must not absorb source-domain truth |
| Communications | Communications | communication_conversations/messages/requests/templates/etc. | patient/tenant workflows, portal | CANONICAL COMMUNICATION DOMAIN |
| Notification delivery | Notification Infrastructure | notification_queue + read receipts + channel prefs | follow-up, communications, system events | DELIVERY/EXECUTION ONLY; not business source of truth |
| Medical files | Medical Files | medical_files + annotations/measurements/storage/sync/AI results | clinical, portal, patient | CANONICAL MEDICAL FILE DOMAIN; runtime/authorization verification required |
| Patient Portal | Portal capability | patient_portal_* tables | patient-facing access to authorized platform state | CONSUMER SURFACE, not independent domain truth |
| Billing / invoicing | Financial | clinic_invoices, invoice_items, payments, refunds, billing_events | commercial, visit, inventory, payroll/commission | CANONICAL FINANCIAL DOMAIN |
| Financial plans / installments | Financial | financial_plans, financial_installments | treatment/commercial/billing | CANONICAL FINANCIAL STATE |
| Insurance | Financial / Insurance subdomain | insurance_providers/contracts/claims/profiles | invoices, patient, reconciliation | OWNER IDENTIFIED; integration validation remains |
| Procurement | Procurement / Financial Resources | purchase_orders/items, purchase_receipts/items, supplier entities | inventory, financial | CANONICAL PROCUREMENT STATE |
| Inventory / resources | Inventory / Financial Resources | inventory_items, lots, ledger, clinic_resources | procedures, procurement, visit | CANONICAL INVENTORY STATE; no parallel stock engine |
| Workforce | Workforce | workforce_* employee, schedule, attendance, leave, skill, qualification entities | agenda, authorization, payroll, procedures | CANONICAL WORKFORCE DOMAIN |
| Payroll / commissions | Workforce Finance | workforce_payroll_*, commission_* | workforce, financial | CANONICAL WORKFORCE FINANCE STATE |
| Analytics / BI | Analytics / Insights | analytics_daily_snapshots + KPI/analytics architecture | all domains | ANALYTICAL CONSUMER; must not become transactional source of truth |
| Audit trail | Platform Governance | audit_trail | all auditable domains | CROSS-CUTTING GOVERNANCE, not business domain truth |
| Feature flags | Platform Configuration | feature_flags | application capabilities | CROSS-CUTTING CONFIGURATION |
| Branches / clinic resources | Clinic Administration | branches, clinic_rooms, clinic_resources, devices | workforce, agenda, inventory, operations | CANONICAL ADMIN/RESOURCE CONFIGURATION; exact boundaries require reconciliation |

## 4. Cross-domain rules

1. One business responsibility has one canonical owner.
2. One major entity has one canonical source of truth.
3. Coordination records execution state; they do not replace source-domain state.
4. Agenda owns appointments; no Patient Journey, Workforce, Coordination or Portal component may become a second scheduler.
5. Follow-up owns follow-up/retention state; Notification Queue only delivers.
6. Financial owns monetary truth; analytics only consumes it.
7. Inventory owns stock truth; procedures may request/consume it but must not maintain a second stock ledger.
8. Authorization is the combination of tenant capability boundary and user authorization; UI visibility is not the authority.
9. Patient Portal consumes authorized platform state; it is not an independent patient/clinical/financial source of truth.
10. Patient Journey integrates domains but does not become a universal database or workflow engine.
11. Clinical, Operational and Administration are workspace classifications/context, not substitutes for authorization roles.
12. Super Admin and Clinic Admin remain distinct authorities.
13. A technical function may orchestrate a cross-domain action only when ownership of the resulting business state remains with the owning domain.
14. Historical implementation names do not create ownership authority.

## 5. Known reconciliation findings

The initial system-wide audit already identifies items that prevent declaring this phase closed:

- Repository and live migration histories are not currently identical.
- The live database contains 126 public tables and 277 public functions, so ownership cannot be inferred from file names alone.
- Several SECURITY DEFINER functions are exposed to authenticated users; security ownership must be reviewed separately from domain ownership.
- There are historical branches covering overlapping workstreams; branch cleanup must be performed only after the authoritative work packages are closed.
- CSAPI-specific functions exist in the live database, but their existence does not make CSAPI the owner of the broader Patient Flow architecture.
- Patient Flow, Visit, Treatment Plan, Follow-up and Coordination have distinct ownership boundaries and must be reconciled as an integrated chain rather than collapsed into one engine.
- The existing documentation contains both domain-level ownership contracts and historical remediation records; authority must be normalized against current implementation evidence.
- Some domain boundaries are established architecturally but still require repository path, database function, authorization boundary and runtime evidence before they can be marked VERIFIED.

## 6. Required completion matrix

For every material domain, closure requires all columns below:

| Required proof | Meaning |
|---|---|
| Architecture | approved requirement/decision identified |
| Owner | exactly one canonical business/technical owner |
| Source | canonical state/table/entity identified |
| Execution | canonical write/read path identified |
| Repository | implementation paths identified |
| Database | tables/functions/triggers/migrations reconciled |
| Authorization | tenant + capability + user permission boundary proven |
| Runtime | representative behavior exercised |
| Verification | independent test evidence recorded |
| Documentation | current docs agree with evidence |
| Cleanup | obsolete duplicate paths/branches are classified and handled |

No domain will be marked CLOSED if any required proof is missing.

## 7. Next execution sequence

This phase continues in the same governance work package:

1. Build the repository-wide domain → source → execution-path inventory.
2. Map each domain to actual repository modules, server actions, functions and migrations.
3. Map each canonical database object to its migration lineage and live state.
4. Reconcile authorization ownership and tenant boundaries.
5. Audit duplicate engines and overlapping ownership.
6. Verify representative runtime paths across the major domains.
7. Record only proven defects as implementation work; do not create speculative redesign.
8. Produce the final system-wide ownership/canonical-source register.
9. Update current-state and handoff records.
10. Close this system-wide foundation only after evidence satisfies the completion matrix.

CSAPI remains a downstream workstream. Its existing PRs/branches are not reactivated by this document.

## 8. Closure rule

The system-wide engineering foundation is CLOSED only when:

System Architecture = Ownership Map = Canonical Sources = Repository = DB/Migrations = Authorization = Runtime Evidence = Documentation

and no unresolved ownership conflict remains.



## 9. Repository implementation-path evidence collected

The following mapping is now grounded in current repository search results rather than inferred from documentation alone:

| Domain | Repository evidence |
|---|---|
| Patient / Identity | `src/domain/patients/patients.queries.ts`, `src/domain/visit/visit.actions.ts`, identity functions/migrations |
| Agenda | `src/domain/agenda/agenda.actions.ts`, `agenda.queries.ts`, `availability.engine.ts`, `conflict.engine.ts` |
| Patient Flow / Queue | `src/domain/queue/queue.queries.ts`, `src/domain/queue/workspace.actions.ts`, CSAPI Gate 01 migrations/tools |
| Treatment Plan | `src/domain/treatment-plan/treatment-plan.actions.ts`, treatment-plan migrations |
| Follow-up | `src/domain/followup/followup.queries.ts`, follow-up automation migrations |
| Journey Coordination | `src/domain/journey-coordination/work.actions.ts`, Work Center, coordination migrations |
| Financial / Invoicing | `src/domain/invoicing/invoicing.actions.ts`, `invoicing.client.ts`, financial resources surfaces |
| Inventory | `src/domain/inventory/inventory.queries.ts`, inventory migrations |
| Workforce | `src/domain/workforce/workforce.actions.ts`, workforce dashboard/payroll surfaces |
| Communications | `src/domain/communications/communications.actions.ts`, communications dashboard |
| Patient Portal | `src/domain/patient-portal/patient-message.actions.ts`, portal surface, portal migrations |
| Medical Files | `src/features/medical-files/domain/actions.ts`, `agent.ts`, medical-files API route |
| Team & Access | `src/domain/users/users.actions.ts`, Team & Access migrations, permission architecture |
| Analytics / BI | KPI definitions under `src/domain/analytics/kpi/`, analytics snapshot migrations |
| Cross-domain reconciliation | `tools/cross-domain-runtime-reconciliation.mjs` and related verification tooling |

This proves that the repository has recognizable domain ownership boundaries. It does **not** by itself prove that every execution path is canonical; that remains part of the active reconciliation.

## 10. Live database ownership evidence collected

The live Supabase schema confirms corresponding canonical state families:

- Patient: `clinic_patients`, `patient_identities`, `patient_clinic_relationships`
- Visit / Clinical: `clinic_visit_sessions`, `clinic_visit_procedures`, `clinical_work_sessions`
- Patient Flow: `patient_flow_queue_entries`, `patient_flow_events`
- Treatment: `clinic_treatment_plans`, `clinic_treatment_plan_items`, `clinic_treatment_plan_visits`
- Agenda: `master_agenda_events`, `clinic_provider_availability`
- Follow-up: `retention_followups`, `followup_automation_rules`
- Coordination: `operational_work_items`, `operational_work_history`
- Financial: `clinic_invoices`, `invoice_items`, `invoice_payments`, `invoice_refunds`, `financial_plans`, `financial_installments`
- Procurement: `purchase_orders`, `purchase_receipts`, supplier obligation/payment tables
- Inventory: `inventory_items`, `inventory_lots`, `inventory_ledger`
- Workforce: `workforce_*` employee, schedule, attendance, qualification, leave and payroll families
- Communications: `communication_* ` tables
- Medical Files: `medical_files` and supporting medical-file tables
- Portal: `patient_portal_* ` tables
- Authorization: `roles`, `permissions`, `role_permissions`, role templates, user permissions/overrides
- Subscription/Entitlement: `subscriptions`, `subscription_plans`, `entitlements`, `entitlement_capabilities`, `tenant_entitlements`
- Analytics: `analytics_daily_snapshots`

## 11. Important evidence boundary

The current evidence is sufficient to establish the **initial system-wide ownership baseline** and to continue reconciliation without returning to CSAPI.

It is not yet sufficient for final closure because the following must still be proven domain by domain:

1. exact canonical write paths;
2. migration lineage for canonical objects;
3. authorization enforcement path;
4. duplicate/legacy execution paths;
5. representative runtime proof;
6. independent verification evidence;
7. final documentation reconciliation.



## 12. Authorization execution evidence — current live boundary

A live read-only inspection of public SECURITY DEFINER functions confirms that authorization is not yet safe to mark globally VERIFIED. The database currently exposes authenticated EXECUTE on multiple SECURITY DEFINER business functions, including inventory mutation, patient identity registration/update, financial mutation, workforce mutation, commercial sale, and CSAPI Patient Flow functions.

Important examples observed live:
- `adjust_inventory_stock` — authenticated EXECUTE
- `consume_procedure_inventory` — authenticated EXECUTE
- `register_patient_identity` — authenticated EXECUTE
- `update_patient_identity` — authenticated EXECUTE
- `execute_commercial_sale` — authenticated EXECUTE
- `receive_purchase_order` — authenticated EXECUTE
- `refund_invoice_payment` — authenticated EXECUTE
- `get_effective_permissions` / `has_effective_permission` — authenticated EXECUTE

This is evidence for a required security/authorization reconciliation, not proof that each function is exploitable. Function-body authorization, tenant checks, grants, RLS interaction and caller paths must be inspected before any remediation is designed.

The finding also confirms that domain ownership and authorization ownership cannot be treated as the same question: a function may belong to the correct domain while still requiring a separate authorization-boundary review.

## 13. Duplicate-engine / ownership audit — first-pass results

The repository search confirms several historical and current implementation layers coexist:

- Follow-up has a canonical domain surface under src/domain/followup/, while automation is implemented through dedicated database functions/migrations such as run_followup_automation, enqueue_followup_notification, and followup_automation_enabled. This is consistent with the rule that Follow-up owns retention state while Notification owns delivery, but the exact application-to-RPC execution chain still requires proof.
- Inventory has a canonical mutation family around the repaired adjust_inventory_stock / consume_procedure_inventory paths and the inventory_ledger. Historical remediation documents explicitly prohibit parallel client-side stock + ledger mutation. The live authenticated EXECUTE boundary remains an authorization reconciliation item.
- Patient Identity has both the canonical identity tables and multiple Gate 03 corrective migration layers. Historical Gate 03 documentation explicitly states that the live register_patient_identity definition had not yet been reconciled with the approved corrective implementation. Therefore identity is not treated as closed merely because repository migrations exist.
- Patient Flow has both domain-level queue/workspace implementation and csapi_d3_* database functions. Their presence does not establish a second Patient Flow owner; they are classified as execution-layer functions subordinate to the Patient Flow/Visit Operations boundary.
- Communications and Notification remain separate by architecture: Communications owns conversation/message state; Notification Queue owns delivery execution. No evidence found in this pass justifies collapsing them into one engine.

No duplicate engine is being removed on this first pass. Each candidate overlap is classified first; removal/refactor requires a proven canonical replacement plus runtime and regression evidence.

## 14. Current reconciliation conclusion

The system-wide foundation remains OPEN.

The work has now progressed from architectural ownership mapping into executable repository/database evidence. Two concrete classes of unresolved proof are confirmed:

1. Authorization boundary: authenticated access to SECURITY DEFINER functions requires function-body, grant and caller-path reconciliation.
2. Canonical execution lineage: several domains contain historical corrective layers and multiple execution surfaces; canonicality must be proven through repository → migration → live DB → runtime tracing rather than inferred from names.

These findings do not reopen CSAPI. They strengthen the system-wide prerequisite and must be resolved before the foundation can be closed.


## 15. Proven authorization defect requiring controlled remediation

The live definition of `update_patient_identity` was inspected directly. It verifies that the caller is an active clinic user in the supplied tenant, but it does not call `has_tenant_permission` / `has_effective_permission` or an equivalent patient-update authorization check before mutating patient and identity records.

This is a concrete authorization-boundary defect, not an advisor-only warning. It must be handled as an implementation remediation under the canonical Patient / Identity ownership path, with regression tests for tenant isolation and the approved `patients:update` permission boundary. No code change is made in the governance reconciliation work package itself; the defect is now explicitly registered as downstream implementation work.

The same inspection confirms that other sensitive SECURITY DEFINER functions such as `adjust_inventory_stock`, `consume_procedure_inventory`, `execute_commercial_sale`, `receive_purchase_order`, and `refund_invoice_payment` do perform tenant and permission checks. Therefore the problem is not accurately described as a universal SECURITY DEFINER failure; it is a function-by-function authorization reconciliation requirement.
