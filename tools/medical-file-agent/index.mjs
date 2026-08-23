import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import http from "node:http";
import Busboy from "busboy";

const API_BASE = (process.env.CORE_SYSTEM_URL || "").replace(/\/$/, "");
const AGENT_TOKEN = process.env.CORE_MEDICAL_FILE_AGENT_TOKEN;
const STORAGE_ROOT = process.env.CORE_MEDICAL_FILE_STORAGE_ROOT || path.resolve(process.cwd(), "medical-files");
const POLL_MS = Number(process.env.CORE_MEDICAL_FILE_POLL_MS || 60000);
const PORT = Number(process.env.CORE_MEDICAL_FILE_AGENT_PORT || 39421);
if (!API_BASE || !AGENT_TOKEN) { console.error("CORE_SYSTEM_URL and CORE_MEDICAL_FILE_AGENT_TOKEN are required"); process.exit(1); }
const headers = { authorization: `Bearer ${AGENT_TOKEN}` };
const statePath = path.join(STORAGE_ROOT, ".agent-state.json");
async function readState() { try { return JSON.parse(await fs.readFile(statePath, "utf8")); } catch { return { files: {} }; } }
async function writeState(state) { await fs.mkdir(STORAGE_ROOT, { recursive: true }); await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf8"); }
function safeName(name) { return name.replace(/[^a-zA-Z0-9._-]/g, "_"); }
async function syncOnce() {
  const response = await fetch(`${API_BASE}/api/medical-files/agent`, { headers }); if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
  const manifest = await response.json(); const state = await readState(); await fs.mkdir(STORAGE_ROOT, { recursive: true });
  for (const file of manifest.files || []) {
    if (!file.download_url || state.files[file.id]?.status === "available") continue;
    const relative = path.join(file.patient_id || "unassigned", file.visit_id || "patient", `${file.id}-${safeName(file.original_filename)}`); const destination = path.join(STORAGE_ROOT, relative); await fs.mkdir(path.dirname(destination), { recursive: true });
    const download = await fetch(file.download_url); if (!download.ok || !download.body) throw new Error(`Download failed for ${file.id}: ${download.status}`);
    const handle = await fs.open(destination, "w"); try { const reader = download.body.getReader(); while (true) { const { done, value } = await reader.read(); if (done) break; await handle.write(value); } } finally { await handle.close(); }
    state.files[file.id] = { status:"available", path:destination, updatedAt:new Date().toISOString() };
    await fetch(`${API_BASE}/api/medical-files/agent`, { method:"POST", headers:{...headers,"content-type":"application/json"}, body:JSON.stringify({ action:"local_available", fileId:file.id, sizeBytes:file.size_bytes, checksumSha256:file.checksum_sha256 }) }); await writeState(state);
  }
}
function json(res,status,body) { res.writeHead(status,{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"}); res.end(JSON.stringify(body)); }
async function handleUpload(req,res) {
  const tempDir=path.join(STORAGE_ROOT,".incoming"); await fs.mkdir(tempDir,{recursive:true}); const tempFile=path.join(tempDir,`${Date.now()}-${Math.random().toString(36).slice(2)}.upload`); const fields={}; let originalName="upload",mimeType=null,sizeBytes=0,fileHandle;
  try {
    const busboy=Busboy({headers:req.headers,limits:{files:1}}); busboy.on("field",(name,value)=>{fields[name]=value;});
    busboy.on("file",async(_name,stream,info)=>{originalName=info.filename||originalName;mimeType=info.mimeType||null;fileHandle=await fs.open(tempFile,"w"); stream.on("data",async(chunk)=>{sizeBytes+=chunk.length;stream.pause();await fileHandle.write(chunk);stream.resume();}); stream.on("end",async()=>{await fileHandle.close();});});
    busboy.on("finish",async()=>{try{const metadata=await fetch(`${API_BASE}/api/medical-files/agent`,{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({action:"create_local_record",filename:originalName,mimeType,sizeBytes,patientId:fields.patientId||undefined,visitId:fields.visitId||undefined})});if(!metadata.ok){await fs.rm(tempFile,{force:true});return json(res,metadata.status,await metadata.json());}const created=await metadata.json();const destination=path.join(STORAGE_ROOT,fields.patientId||"unassigned",fields.visitId||"patient",`${created.fileId}-${safeName(originalName)}`);await fs.mkdir(path.dirname(destination),{recursive:true});await fs.rename(tempFile,destination);const state=await readState();state.files[created.fileId]={status:"available",path:destination,updatedAt:new Date().toISOString()};await writeState(state);await fetch(`${API_BASE}/api/medical-files/agent`,{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({action:"local_available",fileId:created.fileId,sizeBytes})});return json(res,201,{ok:true,fileId:created.fileId,path:destination});}catch(error){await fs.rm(tempFile,{force:true});return json(res,500,{error:error instanceof Error?error.message:String(error)});}}); req.pipe(busboy);
  } catch(error){await fs.rm(tempFile,{force:true});return json(res,500,{error:error instanceof Error?error.message:String(error)});}
}
const server=http.createServer((req,res)=>{if(req.method==="OPTIONS")return json(res,204,{});if(req.url==="/health"&&req.method==="GET")return json(res,200,{ok:true,service:"core-system-medical-file-agent"});if(req.url==="/upload"&&req.method==="POST")return void handleUpload(req,res);return json(res,404,{error:"Not found"});});
server.listen(PORT,"127.0.0.1",()=>console.log(`[medical-file-agent] local upload server listening on http://127.0.0.1:${PORT}`));
async function main(){console.log(`[medical-file-agent] storage=${STORAGE_ROOT}`);while(true){try{await syncOnce();}catch(error){console.error(`[medical-file-agent] ${error instanceof Error?error.message:String(error)}`);}await new Promise((resolve)=>setTimeout(resolve,POLL_MS));}}
main();
