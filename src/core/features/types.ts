// src/core/features/types.ts
// Feature Engine — Type Definitions
// Mirrors src/core/permissions/types.ts to keep Permission Engine and
// Feature Engine structurally symmetric (see EXECUTION_PLAN §5 — Engineering Decisions).
//
// Verified against the live `feature_flags` table (project: core-system-clinic,
// gobdznqbdaklkkqbkynx / qaslsjyxjwvdoiczmhgq) — flag_key values in production:
//   patients, agenda, queue, billing, followup, inventory,
//   AUDIT_TRAIL, INVENTORY_MODULE, MULTI_BRANCH, WHATSAPP_AUTOMATION

export type FeatureModuleKey =
  | "patients"
  | "agenda"
  | "queue"
  | "billing"
  | "followup"
  | "inventory"
  | "analytics"
  | "AUDIT_TRAIL"
  | "INVENTORY_MODULE"
  | "MULTI_BRANCH"
  | "WHATSAPP_AUTOMATION";
