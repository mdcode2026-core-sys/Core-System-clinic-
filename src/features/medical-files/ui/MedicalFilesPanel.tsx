"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ExternalLink, FileText, Image as ImageIcon, RefreshCw, RotateCcw, RotateCw, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { createMedicalFileDownloadUrl, createMedicalFileUpload, finalizeMedicalFileUpload, listMedicalFiles } from "@/features/medical-files/domain/actions";
import type { MedicalFile } from "@/features/medical-files/domain/types";
import { DicomViewer } from "./DicomViewer";

const LOCAL_AGENT_URL = "http://127.0.0.1:39421";

export function MedicalFilesPanel({ patientId, visitId }: { patientId?: string; visitId?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<MedicalFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const load = () => startTransition(async () => {
    try { setFiles(await listMedicalFiles({ patientId, visitId })); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load medical files"); }
  });

  useEffect(() => { load(); }, [patientId, visitId]);

  const emptyLabel = useMemo(
    () => patientId ? "No medical files for this patient yet." : "No medical files awaiting intake.",
    [patientId],
  );

  function resetViewer() { setImageScale(1); setImageRotation(0); }

  async function upload(file: File) {
    try {
      setError(null);
      const localForm = new FormData();
      localForm.append("file", file);
      if (patientId) localForm.append("patientId", patientId);
      if (visitId) localForm.append("visitId", visitId);
      try {
        const localResponse = await fetch(`${LOCAL_AGENT_URL}/upload`, { method: "POST", body: localForm });
        if (localResponse.ok) { load(); return; }
      } catch { /* Local agent unavailable: fall back to cloud ingress. */ }

      const signed = await createMedicalFileUpload({
        filename: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        patientId,
        visitId,
      });
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) throw new Error(uploadError.message);
      await finalizeMedicalFileUpload(signed.fileId);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function openFile(file: MedicalFile) {
    try {
      setError(null);
      resetViewer();
      if (file.file_kind === "dicom") { setSelected(file); setPreviewUrl(null); return; }
      let url: string | null = null;
      if (file.file_kind === "image") {
        try {
          const localResponse = await fetch(`${LOCAL_AGENT_URL}/file/${encodeURIComponent(file.id)}`);
          if (localResponse.ok) url = URL.createObjectURL(await localResponse.blob());
        } catch { /* Local copy unavailable. */ }
      }
      if (!url) url = await createMedicalFileDownloadUrl(file.id);
      if (file.file_kind === "image") { setSelected(file); setPreviewUrl(url); }
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to open file"); }
  }

  function closeSelected() {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelected(null); setPreviewUrl(null); resetViewer();
  }

  return <section className="rounded-xl border bg-card p-4 shadow-sm" aria-label="Medical Files">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div><h3 className="font-semibold">Medical Files</h3><p className="text-xs text-muted-foreground">{patientId ? "Current patient / visit context" : "Administrative intake"}</p></div>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-md border p-2" onClick={load} disabled={isPending} title="Refresh"><RefreshCw className="h-4 w-4" /></button>
        <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => inputRef.current?.click()}><Upload className="mr-2 inline h-4 w-4" />Add files</button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { const selectedFiles = Array.from(e.target.files ?? []); e.currentTarget.value = ""; selectedFiles.forEach(upload); }} />
      </div>
    </div>
    {error && <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">{error}</div>}

    {selected && <div className="mb-4 rounded-xl border bg-muted/20 p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="truncate text-sm font-medium">{selected.original_filename}</span>
        <button type="button" className="rounded p-1 hover:bg-muted" onClick={closeSelected}><X className="h-4 w-4" /></button>
      </div>
      {selected.file_kind === "dicom" ? <DicomViewer fileId={selected.id} /> : previewUrl ? <div>
        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-md border bg-background p-1">
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-muted" title="Zoom out" onClick={() => setImageScale((v) => Math.max(0.25, Number((v - 0.25).toFixed(2))))}><ZoomOut className="mr-1 inline h-3 w-3" />Zoom out</button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-muted" title="Zoom in" onClick={() => setImageScale((v) => Math.min(8, Number((v + 0.25).toFixed(2))))}><ZoomIn className="mr-1 inline h-3 w-3" />Zoom in</button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-muted" title="Rotate left" onClick={() => setImageRotation((v) => v - 90)}><RotateCcw className="mr-1 inline h-3 w-3" />Rotate</button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-muted" title="Rotate right" onClick={() => setImageRotation((v) => v + 90)}><RotateCw className="mr-1 inline h-3 w-3" />Rotate right</button>
          <button type="button" className="ml-auto rounded px-2 py-1 text-xs hover:bg-muted" onClick={resetViewer}>Reset</button>
          <span className="px-2 text-xs text-muted-foreground">{Math.round(imageScale * 100)}%</span>
        </div>
        <div className="max-h-[520px] min-h-[320px] overflow-auto rounded bg-black p-2 text-center">
          <div className="flex min-h-[300px] min-w-full items-center justify-center">
            <img src={previewUrl} alt={selected.original_filename} draggable={false} className="max-w-none object-contain transition-transform duration-150" style={{ transform: `scale(${imageScale}) rotate(${imageRotation}deg)` }} />
          </div>
        </div>
      </div> : null}
    </div>}

    {files.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{emptyLabel}</div> : <div className="grid gap-2">{files.map((file) => <button key={file.id} type="button" onClick={() => void openFile(file)} className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50">{file.file_kind === "image" || file.file_kind === "dicom" ? <ImageIcon className="h-5 w-5 shrink-0" /> : <FileText className="h-5 w-5 shrink-0" />}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{file.original_filename}</span><span className="block text-xs text-muted-foreground">{file.mime_type ?? file.file_kind} · {Math.round(file.size_bytes / 1024)} KB</span></span><ExternalLink className="h-4 w-4 shrink-0" /></button>)}</div>}
  </section>;
}
