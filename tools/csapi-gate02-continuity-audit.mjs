import fs from "node:fs";

const queryFile = fs.readFileSync("src/domain/patients/patients.queries.ts", "utf8");
const contextFile = fs.readFileSync("src/features/patient-context/PatientContextPanel.tsx", "utf8");
const gateFile = fs.readFileSync("docs/CSAPI/GATES/GATE-02-PATIENT-JOURNEY.md", "utf8");

const mustContain = (source, value, label) => {
  if (!source.includes(value)) throw new Error(`CSAPI Gate 02 audit failed: ${label}`);
};

mustContain(queryFile, 'from("clinic_visit_sessions")', "canonical Visit source is not used");
mustContain(queryFile, 'export function usePatientVisits', "canonical patient Visit continuity query is missing");
mustContain(queryFile, 'session_status,session_started_at,session_ended_at,visit_closed_at,agenda_event_id', "Visit continuity references are incomplete");
mustContain(contextFile, 'usePatientVisits', "Patient Context does not consume canonical Visit continuity");
mustContain(contextFile, 'visitsQuery.data', "Patient Context does not derive visit continuity from Visit data");
if (contextFile.includes("history?.total_visits") || contextFile.includes("history?.last_visit_date")) {
  throw new Error("CSAPI Gate 02 audit failed: Patient Context still uses summary patient_history as the Visit continuity source");
}
if (queryFile.includes("create table") || contextFile.includes("PatientJourneyEngine") || contextFile.includes("patient_journey_state")) {
  throw new Error("CSAPI Gate 02 audit failed: parallel Patient Journey state/engine detected");
}
mustContain(gateFile, "Patient Journey has no universal terminal state", "approved P6 boundary is missing");
mustContain(gateFile, "No Agenda repair is authorized", "Agenda boundary is missing");
mustContain(gateFile, "Gate 11 remains a separate gate", "Follow-up boundary is missing");

console.log("CSAPI Gate 02 continuity audit: PASS");
