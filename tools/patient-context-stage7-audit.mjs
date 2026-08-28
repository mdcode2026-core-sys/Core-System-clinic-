import fs from "node:fs";

const required = [
  "src/features/patient-context/PatientContextPanel.tsx",
  "src/features/patients/patient-detail.tsx",
  "src/app/(dashboard)/agenda/page.tsx",
  "src/app/(dashboard)/invoices/page.tsx",
  "src/core/i18n/messages.ts",
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Stage 7 required file missing: ${file}`);
}

const context = fs.readFileSync(required[0], "utf8");
const detail = fs.readFileSync(required[1], "utf8");
const agenda = fs.readFileSync(required[2], "utf8");
const invoices = fs.readFileSync(required[3], "utf8");
const messages = fs.readFileSync(required[4], "utf8");

const mustContain = (source, value, label) => {
  if (!source.includes(value)) throw new Error(`Stage 7 audit failed: ${label}`);
};

for (const permission of ["agenda:read", "treatment_plans:read", "invoices:read", "followup:read", "visits:read"]) {
  mustContain(context, `hasPermission(\"${permission}\")`, `missing UI permission gate ${permission}`);
}

for (const href of ["/agenda?patientId=", "/treatment-plans?patientId=", "/invoices?patientId=", "/follow-up?patientId="]) {
  mustContain(context, href, `missing patient-context link ${href}`);
}

mustContain(detail, "PatientContextPanel", "Patient Detail does not expose Patient Context");
mustContain(agenda, "searchParams.get(\"patientId\")", "Agenda does not consume patient context");
mustContain(agenda, "event.patient_id === patientId", "Agenda does not scope visible events to patient context");
mustContain(invoices, "listInvoices(patientId ? { patient_id: patientId } : {})", "Invoices do not preserve patient context");
mustContain(messages, "patientContext:", "Arabic/English patient context catalog is missing");

if (context.includes("create table") || context.includes("clinic_patients_new") || context.includes("patient_context_permissions")) {
  throw new Error("Stage 7 audit failed: patient context introduced a parallel data/authorization architecture");
}

console.log("Stage 7 Patient Context audit: PASS");
