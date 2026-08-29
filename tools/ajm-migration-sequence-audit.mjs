import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "supabase/migrations");
const expected = [
  "20260829160000_ajm_3_workforce_foundation.sql",
  "20260829160500_ajm_3_seed_workforce_leave_types.sql",
  "20260829161500_ajm_3_workforce_tenant_integrity.sql",
  "20260829170000_ajm_4_communications_foundation.sql",
  "20260829173000_ajm_5_journey_coordination_foundation.sql",
  "20260829180000_ajm_7_cross_domain_links.sql",
  "20260829190000_ajm_8_security_runtime_hardening.sql",
];
const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };
const files = fs.readdirSync(dir);

expected.forEach((file, index) => {
  const full = path.join(dir, file);
  expect(fs.existsSync(full), `Missing integrated migration: ${file}`);
  if (!fs.existsSync(full)) return;
  const sql = fs.readFileSync(full, "utf8").toLowerCase();
  expect(!/drop\s+table\b|drop\s+column\b|truncate\s+/.test(sql), `Destructive DDL found in ${file}`);
  if (index === 0) expect(sql.includes("create table if not exists public.workforce_"), "AJM-3 foundation must create Workforce tables idempotently");
  if (index === 2) expect(sql.includes("same_tenant_fk"), "AJM-3 tenant-integrity migration must add same-tenant foreign keys");
  if (index === 3) expect(sql.includes("enable row level security"), "AJM-4 migration must enable RLS");
  if (index === 4) expect(sql.includes("operational_work_items") && sql.includes("operational_work_history"), "AJM-5 migration must define the canonical work layer and history");
  if (index === 5) expect(sql.includes("communication_requests") && sql.includes("operational_work_items"), "AJM-7 migration must link Communications and Coordination");
  if (index === 6) expect(sql.includes("workforce_attendance_read") && sql.includes("communications_participants_access"), "AJM-8 security hardening must define sensitive read and participant policies");
});

const timestamps = expected.map((file) => file.slice(0, 14));
expect(timestamps.every((value, i) => i === 0 || value > timestamps[i - 1]), "Integrated migration timestamps must be strictly increasing");
const unexpected = files.filter((file) => /^20260829(16|17|18|19)\d+.*ajm.*\.sql$/.test(file) && !expected.includes(file));
expect(unexpected.length === 0, `Unexpected AJM migration in the integrated timestamp window: ${unexpected.join(", ")}`);

if (failures.length) {
  console.error("AJM integrated migration sequence audit FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`AJM integrated migration sequence audit PASS — ${expected.length} migrations, ordered and non-destructive.`);
