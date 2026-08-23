import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API_BASE = (process.env.CORE_SYSTEM_URL || "").replace(/\/$/, "");
const AGENT_TOKEN = process.env.CORE_MEDICAL_FILE_AGENT_TOKEN;
const STORAGE_ROOT = process.env.CORE_MEDICAL_FILE_STORAGE_ROOT || path.resolve(process.cwd(), "medical-files");
const POLL_MS = Number(process.env.CORE_MEDICAL_FILE_POLL_MS || 60000);

if (!API_BASE || !AGENT_TOKEN) {
  console.error("CORE_SYSTEM_URL and CORE_MEDICAL_FILE_AGENT_TOKEN are required");
  process.exit(1);
}

const headers = { authorization: `Bearer ${AGENT_TOKEN}` };
const statePath = path.join(STORAGE_ROOT, ".agent-state.json");

async function readState() {
  try { return JSON.parse(await fs.readFile(statePath, "utf8")); } catch { return { files: {} }; }
}
async function writeState(state) {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}
function safeName(name) { return name.replace(/[^a-zA-Z0-9._-]/g, "_"); }

async function syncOnce() {
  const response = await fetch(`${API_BASE}/api/medical-files/agent`, { headers });
  if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
  const manifest = await response.json();
  const state = await readState();
  await fs.mkdir(STORAGE_ROOT, { recursive: true });

  for (const file of manifest.files || []) {
    if (!file.download_url) continue;
    const relative = path.join(file.patient_id || "unassigned", file.visit_id || "patient", `${file.id}-${safeName(file.original_filename)}`);
    const destination = path.join(STORAGE_ROOT, relative);
    if (state.files[file.id]?.status === "available") continue;
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const download = await fetch(file.download_url);
    if (!download.ok || !download.body) throw new Error(`Download failed for ${file.id}: ${download.status}`);
    const handle = await fs.open(destination, "w");
    try {
      const reader = download.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await handle.write(value);
      }
    } finally { await handle.close(); }
    state.files[file.id] = { status: "available", path: destination, updatedAt: new Date().toISOString() };
    await fetch(`${API_BASE}/api/medical-files/agent`, { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ action: "local_available", fileId: file.id, sizeBytes: file.size_bytes, checksumSha256: file.checksum_sha256 }) });
    await writeState(state);
  }
  console.log(`[medical-file-agent] synchronized ${Object.keys(manifest.files || {}).length} file(s)`);
}

async function main() {
  console.log(`[medical-file-agent] storage=${STORAGE_ROOT}`);
  while (true) {
    try { await syncOnce(); } catch (error) { console.error(`[medical-file-agent] ${error instanceof Error ? error.message : String(error)}`); }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

main();
