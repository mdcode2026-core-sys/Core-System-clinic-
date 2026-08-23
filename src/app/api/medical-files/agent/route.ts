import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "medical-files";
function adminClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) throw new Error("Supabase service role configuration is missing"); return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }); }
function tokenFrom(req: NextRequest) { const value = req.headers.get("authorization") ?? ""; return value.startsWith("Bearer ") ? value.slice(7) : null; }
async function authenticate(req: NextRequest) { const token = tokenFrom(req); if (!token) return null; const supabase = adminClient(); const hash = createHash("sha256").update(token).digest("hex"); const { data } = await supabase.from("tenant_devices").select("id, tenant_id, device_name, is_active").eq("agent_token_hash", hash).eq("is_active", true).maybeSingle(); return data ?? null; }
function safeName(value: string) { return value.replace(/[^a-zA-Z0-9._-]/g, "_"); }

export async function GET(req: NextRequest) {
  try {
    const device = await authenticate(req); if (!device) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = adminClient();
    const { data: subscription } = await supabase.from("subscriptions").select("subscription_plans(medical_file_cloud_mode)").eq("tenant_id", device.tenant_id).in("status", ["trial", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const plan = subscription?.subscription_plans as { medical_file_cloud_mode?: string } | null;
    const cloudMode = plan?.medical_file_cloud_mode ?? "local_first";
    const { data: files, error } = await supabase.from("medical_files").select("id, patient_id, visit_id, original_filename, mime_type, size_bytes, storage_path, storage_status, availability, checksum_sha256").eq("tenant_id", device.tenant_id).neq("storage_status", "archived").limit(500);
    if (error) throw error;
    const manifest = [];
    for (const file of files ?? []) {
      const localAvailable = (file.availability as Record<string, unknown> | null)?.local === "available";
      if (file.storage_path && file.storage_status === "available" && !localAvailable && (file.availability as Record<string, unknown> | null)?.cloud === "available") {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 600);
        manifest.push({ ...file, download_url: signed?.signedUrl ?? null, cloud_mode: cloudMode });
      }
    }
    await supabase.from("tenant_devices").update({ last_seen_at: new Date().toISOString(), health_status: "healthy" }).eq("id", device.id);
    return NextResponse.json({ device, cloud_mode: cloudMode, files: manifest });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Agent request failed" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const device = await authenticate(req); if (!device) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json() as { action: "create_local_record" | "local_available" | "cloud_upload_ticket" | "cloud_upload_complete"; fileId?: string; filename?: string; mimeType?: string | null; sizeBytes?: number; patientId?: string; visitId?: string; checksumSha256?: string };
    const supabase = adminClient();
    if (body.action === "create_local_record") {
      if (!body.filename || !body.sizeBytes || body.sizeBytes < 0) return NextResponse.json({ error: "Invalid file metadata" }, { status: 400 });
      if (body.patientId) { const { data: patient } = await supabase.from("clinic_patients").select("id").eq("id", body.patientId).eq("tenant_id", device.tenant_id).maybeSingle(); if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 }); }
      if (body.visitId) { const { data: visit } = await supabase.from("clinic_visit_sessions").select("id, patient_id").eq("id", body.visitId).eq("tenant_id", device.tenant_id).maybeSingle(); if (!visit || (body.patientId && visit.patient_id !== body.patientId)) return NextResponse.json({ error: "Invalid visit" }, { status: 400 }); }
      const id = crypto.randomUUID();
      const kind = body.mimeType?.startsWith("image/") ? "image" : body.mimeType === "application/dicom" || body.filename.toLowerCase().endsWith(".dcm") ? "dicom" : body.mimeType?.startsWith("video/") ? "video" : body.mimeType?.includes("pdf") ? "document" : "other";
      const localPath = `local://${device.id}/${id}/${safeName(body.filename)}`;
      const { error } = await supabase.from("medical_files").insert({ id, tenant_id: device.tenant_id, patient_id: body.patientId ?? null, visit_id: body.visitId ?? null, file_kind: kind, original_filename: body.filename, mime_type: body.mimeType ?? null, extension: body.filename.includes(".") ? body.filename.split(".").pop()?.toLowerCase() : null, size_bytes: body.sizeBytes, checksum_sha256: body.checksumSha256 ?? null, storage_provider: "local", storage_path: localPath, storage_status: "available", availability: { local: "available", cloud: "unavailable" }, created_by: null });
      if (error) throw error;
      await supabase.from("medical_file_storage_locations").insert({ medical_file_id: id, tenant_id: device.tenant_id, provider: "clinic_local", device_id: device.id, object_path: localPath, size_bytes: body.sizeBytes, checksum_sha256: body.checksumSha256 ?? null, status: "available", last_verified_at: new Date().toISOString() });
      return NextResponse.json({ fileId: id, storage_path: localPath, cloud_mode: "local_first" });
    }
    if (!body.fileId) return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    if (body.action === "local_available") {
      const { data: file } = await supabase.from("medical_files").select("id, size_bytes, storage_path, availability").eq("id", body.fileId).eq("tenant_id", device.tenant_id).maybeSingle();
      if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
      const availability = { ...(file.availability as Record<string, unknown> ?? {}), local: "available" };
      await supabase.from("medical_files").update({ availability }).eq("id", file.id).eq("tenant_id", device.tenant_id);
      await supabase.from("medical_file_storage_locations").upsert({ medical_file_id: file.id, tenant_id: device.tenant_id, provider: "clinic_local", device_id: device.id, object_path: file.storage_path ?? file.id, size_bytes: body.sizeBytes ?? file.size_bytes, checksum_sha256: body.checksumSha256 ?? null, status: "available", last_verified_at: new Date().toISOString(), last_synced_at: new Date().toISOString() }, { onConflict: "medical_file_id,provider,device_id" });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "cloud_upload_ticket") {
      const { data: file } = await supabase.from("medical_files").select("id, storage_path, original_filename, size_bytes, mime_type").eq("id", body.fileId).eq("tenant_id", device.tenant_id).maybeSingle();
      if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
      const path = file.storage_path?.startsWith("local://") ? `${device.tenant_id}/${file.id}/${safeName(file.original_filename)}` : (file.storage_path ?? `${device.tenant_id}/${file.id}/${safeName(file.original_filename)}`);
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path); if (error || !data) throw error ?? new Error("Unable to create upload ticket");
      await supabase.from("medical_files").update({ storage_path: path }).eq("id", file.id).eq("tenant_id", device.tenant_id);
      return NextResponse.json({ path, token: data.token, bucket: BUCKET });
    }
    if (body.action === "cloud_upload_complete") {
      const { data: file } = await supabase.from("medical_files").select("id, storage_path, size_bytes, availability").eq("id", body.fileId).eq("tenant_id", device.tenant_id).maybeSingle();
      if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
      const availability = { ...(file.availability as Record<string, unknown> ?? {}), cloud: "available" };
      await supabase.from("medical_files").update({ availability, storage_status: "available", storage_provider: "hybrid" }).eq("id", file.id).eq("tenant_id", device.tenant_id);
      await supabase.from("medical_file_storage_locations").upsert({ medical_file_id: file.id, tenant_id: device.tenant_id, provider: "cloud", object_path: file.storage_path ?? file.id, size_bytes: body.sizeBytes ?? file.size_bytes, checksum_sha256: body.checksumSha256 ?? null, status: "available", last_verified_at: new Date().toISOString(), last_synced_at: new Date().toISOString() }, { onConflict: "medical_file_id,provider,device_id" });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Agent request failed" }, { status: 500 }); }
}
