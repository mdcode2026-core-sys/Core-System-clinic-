import { NextResponse } from "next/server";
import { createAgendaEventMutation, updateAgendaEventMutation } from "@/domain/agenda/agenda.mutation-service";

type AgendaRequestBody = {
  id?: string;
  patient_id?: string;
  doctor_id?: string;
  room_id?: string | null;
  resource_id?: string | null;
  procedure_id?: string | null;
  inquiry_id?: string | null;
  scheduled_start?: string;
  scheduled_end?: string;
  notes?: string | null;
  reschedule?: boolean;
};

const INVALID_REQUEST = "AGENDA_INVALID_REQUEST";

async function parseBody(request: Request): Promise<AgendaRequestBody | null> {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value) ? (value as AgendaRequestBody) : null;
  } catch {
    return null;
  }
}

function required(body: AgendaRequestBody) {
  return body.patient_id?.trim() && body.doctor_id?.trim() && body.scheduled_start?.trim() && body.scheduled_end?.trim();
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  if (!body || !required(body)) return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });
  const result = await createAgendaEventMutation({
    patientId: body.patient_id!.trim(),
    doctorId: body.doctor_id!.trim(),
    roomId: body.room_id || null,
    resourceId: body.resource_id || null,
    procedureId: body.procedure_id || null,
    inquiryId: body.inquiry_id || null,
    scheduledStart: body.scheduled_start!.trim(),
    scheduledEnd: body.scheduled_end!.trim(),
    notes: body.notes?.trim() || null,
  });
  return NextResponse.json(result, { status: result.error ? (result.error === "AGENDA_PERMISSION_DENIED" ? 403 : result.error === "AGENDA_TENANT_MISSING" ? 401 : 409) : 201 });
}

export async function PATCH(request: Request) {
  const body = await parseBody(request);
  if (!body || !body.id?.trim() || !required(body)) return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });
  const result = await updateAgendaEventMutation({
    eventId: body.id.trim(),
    patientId: body.patient_id!.trim(),
    doctorId: body.doctor_id!.trim(),
    roomId: body.room_id || null,
    resourceId: body.resource_id || null,
    procedureId: body.procedure_id || null,
    inquiryId: body.inquiry_id || null,
    scheduledStart: body.scheduled_start!.trim(),
    scheduledEnd: body.scheduled_end!.trim(),
    notes: body.notes?.trim() || null,
    reschedule: body.reschedule === true,
  });
  return NextResponse.json(result, { status: result.error ? (result.error === "AGENDA_PERMISSION_DENIED" ? 403 : result.error === "AGENDA_TENANT_MISSING" ? 401 : 409) : 200 });
}
