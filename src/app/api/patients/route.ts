import { NextResponse } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthorizedTenantId } from "@/domain/patients/patients.authorization";
import type { PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

type PatientPayload = Partial<PatientInsert> & { id?: string };
const TENANT_MISSING = "PATIENT_TENANT_MISSING";
const DATABASE_ERROR = "PATIENT_DATABASE_ERROR";
const INVALID_REQUEST = "PATIENT_INVALID_REQUEST";

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function normalizedPayload(input: PatientPayload) {
  return {
    first_name: clean(input.first_name) ?? "",
    last_name: clean(input.last_name) ?? "",
    first_name_ar: clean(input.first_name_ar),
    last_name_ar: clean(input.last_name_ar),
    date_of_birth: clean(input.date_of_birth),
    gender: input.gender,
    phone_primary: clean(input.phone_primary) ?? "",
    phone_secondary: clean(input.phone_secondary),
    email: clean(input.email),
    preferred_channel: input.preferred_channel ?? "whatsapp",
    first_visit_date: clean(input.first_visit_date),
    referral_source: clean(input.referral_source),
    patient_status: input.patient_status ?? "active",
    notes: clean(input.notes),
  };
}

async function parseBody(request: Request): Promise<PatientPayload | null> {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value) ? (value as PatientPayload) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  if (!body) return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });
  const firstName = clean(body.first_name);
  const lastName = clean(body.last_name);
  const phone = clean(body.phone_primary);
  if (!firstName || !lastName || !phone) return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });

  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: TENANT_MISSING }, { status: 401 });

  const id = crypto.randomUUID();
  const patient: PatientInsert = { ...normalizedPayload(body), tenant_id: tenantId, first_name: firstName, last_name: lastName, phone_primary: phone };
  const { error } = await supabase.from("clinic_patients").insert({ ...patient, id });
  if (error) {
    console.error("[patients/api] create failed", { message: error.message, code: error.code });
    return NextResponse.json({ error: DATABASE_ERROR }, { status: 500 });
  }
  return NextResponse.json({ data: { id } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await parseBody(request);
  if (!body || !clean(body.id)) return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: TENANT_MISSING }, { status: 401 });

  const update = normalizedPayload(body) as PatientUpdate;
  const { error } = await supabase
    .from("clinic_patients")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", body.id as string)
    .eq("tenant_id", tenantId);
  if (error) {
    console.error("[patients/api] update failed", { message: error.message, code: error.code });
    return NextResponse.json({ error: DATABASE_ERROR }, { status: 500 });
  }
  return NextResponse.json({ data: { id: body.id } });
}

export async function DELETE(request: Request) {
  const body = await parseBody(request);
  if (!body || !clean(body.id)) return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: TENANT_MISSING }, { status: 401 });

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("clinic_patients")
    .update({ deleted_at: now, updated_at: now })
    .eq("id", body.id as string)
    .eq("tenant_id", tenantId);
  if (error) {
    console.error("[patients/api] delete failed", { message: error.message, code: error.code });
    return NextResponse.json({ error: DATABASE_ERROR }, { status: 500 });
  }
  return NextResponse.json({ data: { id: body.id } });
}
