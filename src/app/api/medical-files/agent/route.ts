import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "medical-files";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role configuration is missing");
  return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function tokenFrom(req: NextRequest) { const value = req.headers.get("authorization") ?? ""; return value.startsWith("Bearer ") ? value.slice(7) : null; }
async function authenticate(req: NextRequest) {
  const token = tokenFrom(req);
  if (!token) return null;
  const supabase = adminClient();
  const hash = createHash("sha256").update(token).digest("hex");
  const { data } = await supabase.from("tenant_devices").select("id, tenant_id, device_name, is_active").eq("agent_token_hash", hash).eq("is_active", true).maybeSingle();
  return data ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const device = await authenticate(req);
    if (!device) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = adminClient();
    const { data: files, error } = await supabase.from("medical_files").select("id, patient_id, visit_id, original_filename, mime_type, size_bytes, storage_path, storage_status, availability, checksum_sha256").eq("tenant_id", device.tenant_id).neq("storage_status", "archived").limit(500);
    if (error) throw error;
    const manifest = [];
    for (const file of files ?? []) {
      const localAvailable = (file.availability as Record<string, unknown> | null)?.local === "available";
      if (file.storage_path && file.storage_status === "available" && !localAvailable) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 600);
        manifest.push({ ...file, download_url: signed?.signedUrl ?? null });
      }
    }
    await supabase.from("tenant_devices").update({ last_seen_at: new Date().toISOString(), health_status: "healthy" }).eq("id", device.id);
    return NextResponse.json({ device, files: manifest });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Agent request failed" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const device = await authenticate(req);
    if (!device) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json() as { action: "local_available" | "cloud_upload_ticket" | "cloud_upload_complete"; fileId: string; sizeBytes?: number; checksumSha256?: string };
    const supabase = adminClient();
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
      const path = file.storage_path ?? `${device.tenant_id}/${file.id}/${file.original_filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw error ?? new Error("Unable to create upload ticket");
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
