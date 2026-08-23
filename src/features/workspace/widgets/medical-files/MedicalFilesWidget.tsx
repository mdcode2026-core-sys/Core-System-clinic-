"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { FileText, Image as ImageIcon, Upload, ExternalLink, RefreshCw } from "lucide-react";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { createClient } from "@/infrastructure/supabase/client";
import { createMedicalFileDownloadUrl, createMedicalFileUpload, finalizeMedicalFileUpload, listMedicalFiles } from "@/features/medical-files/domain/actions";
import type { MedicalFile } from "@/features/medical-files/domain/types";

export function MedicalFilesWidget({ context }: WidgetComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const patientId = context?.patientId;
  const visitId = context?.visitId;

  const load = () => startTransition(async () => {
    try { setFiles(await listMedicalFiles({ patientId, visitId })); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load medical files"); }
  });

  useEffect(() => { load(); }, [patientId, visitId]);

  const emptyLabel = useMemo(() => patientId ? "No medical files for this patient yet." : "No medical files awaiting intake.", [patientId]);

  async function upload(file: File) {
    try {
      setError(null);
      const signed = await createMedicalFileUpload({ filename: file.name, mimeType: file.type || null, sizeBytes: file.size, patientId, visitId });
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) throw new Error(uploadError.message);
      await finalizeMedicalFileUpload(signed.fileId);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function openFile(file: MedicalFile) {
    try { const url = await createMedicalFileDownloadUrl(file.id); window.open(url, "_blank", "noopener,noreferrer"); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to open file"); }
  }

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm" aria-label="Medical Files">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Medical Files</h3>
          <p className="text-xs text-muted-foreground">{patientId ? "Current patient context" : "Administrative intake"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md border p-2" onClick={load} disabled={isPending} title="Refresh"><RefreshCw className="h-4 w-4" /></button>
          <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => inputRef.current?.click()}><Upload className="mr-2 inline h-4 w-4" />Add files</button>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { const selected = Array.from(e.target.files ?? []); e.currentTarget.value = ""; selected.forEach(upload); }} />
        </div>
      </div>
      {error && <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">{error}</div>}
      {files.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>
      ) : (
        <div className="grid gap-2">
          {files.map((file) => (
            <button key={file.id} type="button" onClick={() => openFile(file)} className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50">
              {file.file_kind === "image" ? <ImageIcon className="h-5 w-5 shrink-0" /> : <FileText className="h-5 w-5 shrink-0" />}
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{file.original_filename}</span><span className="block text-xs text-muted-foreground">{file.mime_type ?? file.file_kind} · {Math.round(file.size_bytes / 1024)} KB</span></span>
              <ExternalLink className="h-4 w-4 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
