import { NextResponse } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthorizedTenantId } from "@/domain/patients/patients.authorization";
import type { PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

type PatientPayload = Partial<PatientInsert> & { id?: string };
type PatientGender = NonNullable<PatientInsert["gender"]>;

const TENANT_MISSING = "PATIENT_TENANT_MISSING";
const DATABASE_ERROR = "PATIENT_DATABASE_ERROR";
const INVALID_REQUEST = "PATIENT_INVALID_REQUEST";

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function normalizeGender(value: unknown): PatientGender | undefined {
  const gender = clean(value);
  return gender === "male" || gender === "female" || gender === "other" ? gender : undefined;
}

function normalizedPayload(input: PatientPayload) {
  const gender = normalizeGender(input.gender);
  return {
    first_name: clean(input.first_name) ?? "",
    last_name: clean(input.last_name) ?? "",
    father_name: clean(input.father_name),
    family_name: clean(input.family_name) ?? clean(input.last_name),
    mother_name: clean(input.mother_name),
    national_id: clean(input.national_id),
    age_at_registration: typeof input.age_at_registration === "number" ? input.age_at_registration : undefined,
    age_reference_date: clean(input.age_reference_date),
    first_name_ar: clean(input.first_name_ar),
    last_name_ar: clean(input.last_name_ar),
    date_of_birth: clean(input.date_of_birth),
    ...(gender ? { gender } : {}),
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
  const fatherName = clean(body.father_name);
  const familyName = clean(body.family_name) ?? clean(body.last_name);
  const phone = clean(body.phone_primary);
  const gender = normalizeGender(body.gender);
  if (!firstName || !fatherName || !familyName || !phone || !gender || (!clean(body.date_of_birth) && typeof body.age_at_registration !== "number")) {
    return NextResponse.json({ error: INVALID_REQUEST }, { status: 400 });
  }

  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: TENANT_MISSING }, { status: 401 });

  const { data, error } = await supabase.rpc("register_patient_identity", {
    p_tenant_id: tenantId,
    p_registration: {
      ...normalizedPayload(body),
      first_name: firstName,
      father_name: fatherName,
      family_name: familyName,
      last_name: familyName,
      mother_name: clean(body.mother_name),
      national_id: clean(body.national_id),
      age_at_registration: typeof body.age_at_registration === "number" ? body.age_at_registration : null,
      age_reference_date: clean(body.age_reference_date) ?? new Date().toISOString().slice(0,10),
    },
  });
  if (error) {
    console.error("[patients/api] identity registration failed", { message: error.message, code: error.code });
    return NextResponse.json({ error: DATABASE_ERROR }, { status: 500 });
  }
  if (!data?.success) {
    const status = data?.outcome === "REVIEW_REQUIRED" ? 409 : 400;
    return NextResponse.json({ ...data, error: data?.error ?? data?.outcome ?? INVALID_REQUEST }, { status });
  }
  return NextResponse.json(data, { status: 201 });
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
