import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const must = (source, value, label) => {
  if (!source.includes(value)) throw new Error("CSAPI Gate 03 audit failed: " + label);
};

const migration = read("supabase/migrations/20260922130830_csapi_gate03_patient_identity_execution.sql");
const reviewMigration = read("supabase/migrations/20260922130928_csapi_gate03_patient_identity_review_resolution.sql");
const repairMigration = read("supabase/migrations/20260922131239_csapi_gate03_restore_portal_policy_boundary_v2.sql");
const hardening = read("supabase/migrations/20260922131621_csapi_gate03_identity_security_performance_hardening.sql");
const correction = read("supabase/migrations/20260922131803_csapi_gate03_patient_match_v2_weight_correction.sql");
const actions = read("src/domain/patients/patients.actions.ts");
const api = read("src/app/api/patients/route.ts");
const queries = read("src/domain/patients/patients.queries.ts");
const list = read("src/features/patients/patient-list.tsx");
const form = read("src/features/patients/patient-form.tsx");
const portal = read("src/domain/patient-portal/portal.actions.ts");
const communications = read("src/domain/communications/communications.actions.ts");
const contract = read("docs/testing/workstream-contracts/csapi-gate03-patient-identity.execution.json");

must(migration, "patient_identities", "canonical identity table missing");
must(migration, "patient_identity_identifiers", "identifier registry missing");
must(migration, "patient_portal_identities", "separate portal identity missing");
must(migration, "patient_identity_match_audit", "match audit missing");
must(migration, "drop constraint if exists uq_patient_phone", "phone uniqueness still blocks evidence-based matching");
must(correction, "v_score := v_score + 20", "national ID weight missing");
must(correction, "v_score := v_score + 25", "DOB weight missing");
must(correction, "v_score := v_score + 18", "father weight missing");
must(correction, "v_score := v_score + 15", "family weight missing");
must(correction, "v_score := v_score + 10", "first-name weight missing");
must(correction, "v_score := v_score + 5", "mother weight missing");
must(correction, "v_score := v_score + 4", "sex weight missing");
must(correction, "v_score := v_score + 2", "phone weight missing");
must(correction, "v_score := v_score + 1", "email weight missing");
must(migration, "v_best_score >= 80", "EXACT_MATCH threshold missing");
must(reviewMigration, "resolve_patient_identity_match", "human match resolution missing");
must(api, "resolve_patient_identity_match", "API review resolution missing");
must(api, "update_patient_identity", "identity-preserving update missing");
must(actions, "update_patient_identity", "server action still writes demographic truth directly");
must(queries, "search_patient_records", "authoritative patient search RPC missing");
must(list, "usePatients(tenantId, searchQuery)", "Patient Module search is not authoritative");
must(form, "resolveReview", "REVIEW_REQUIRED UI resolution missing");
must(portal, "patient_portal_identities", "Portal auth separation missing");
must(communications, "patient_portal_identities", "Communications portal uploader lookup missing");
if (communications.includes('.from("patient_identities")') && communications.includes('auth_user_id')) throw new Error("CSAPI Gate 03 audit failed: Communications still uses legacy patient identity auth lookup");
must(repairMigration, "patient_portal_identities", "portal policy boundary not restored");
must(hardening, "patient_identity_deny_direct_access", "identity direct-access deny policy missing");
must(contract, "patient-match-v2", "binding Gate 03 execution contract missing");
if (portal.includes(".from(\"patient_identities\")")) throw new Error("CSAPI Gate 03 audit failed: Portal still queries canonical identity as auth identity");
if (queries.includes(".from(\"patient_history\")")) throw new Error("CSAPI Gate 03 audit failed: patient_history is being used by Patient queries as canonical history");

console.log("CSAPI Gate 03 identity audit: PASS");
