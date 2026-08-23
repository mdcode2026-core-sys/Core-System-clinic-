"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Ruler, Save, ZoomIn } from "lucide-react";
import { createMedicalFileDownloadUrl } from "@/features/medical-files/domain/actions";
import { listMedicalAnnotations, saveMedicalAnnotation } from "@/features/medical-files/domain/imaging-actions";
import { annotation, addTool, Enums as ToolEnums, LengthTool, PanTool, ToolGroupManager, WindowLevelTool, ZoomTool, init as toolsInit } from "@cornerstonejs/tools";
import { Enums, RenderingEngine, init as coreInit } from "@cornerstonejs/core";
import { init as dicomLoaderInit } from "@cornerstonejs/dicom-image-loader";

let initPromise: Promise<void> | null = null;
function initializeCornerstone() {
  if (!initPromise) initPromise = Promise.all([coreInit(), dicomLoaderInit(), toolsInit()]).then(() => undefined);
  return initPromise;
}

export function DicomViewer({ fileId }: { fileId: string }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RenderingEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<"zoom" | "length" | "window">("zoom");

  useEffect(() => {
    let cancelled = false;
    const engineId = `medical-file-${fileId}`;
    const viewportId = `medical-file-viewport-${fileId}`;
    const toolGroupId = `medical-file-tools-${fileId}`;
    (async () => {
      try {
        await initializeCornerstone();
        const url = await createMedicalFileDownloadUrl(fileId);
        if (cancelled || !elementRef.current) return;
        const renderingEngine = new RenderingEngine(engineId);
        engineRef.current = renderingEngine;
        renderingEngine.enableElement({ viewportId, element: elementRef.current, type: Enums.ViewportType.STACK });
        const viewport = renderingEngine.getViewport(viewportId);
        const imageId = `wadouri:${url}`;
        await viewport.setStack([imageId], 0);
        viewport.render();
        [ZoomTool, PanTool, WindowLevelTool, LengthTool].forEach((item) => addTool(item));
        const group = ToolGroupManager.createToolGroup(toolGroupId);
        if (group) {
          group.addTool(ZoomTool.toolName);
          group.addTool(PanTool.toolName);
          group.addTool(WindowLevelTool.toolName);
          group.addTool(LengthTool.toolName);
          group.addViewport(viewportId, engineId);
          group.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }] });
          group.setToolActive(WindowLevelTool.toolName, { bindings: [{ mouseButton: ToolEnums.MouseBindings.Secondary }] });
        }
        const saved = await listMedicalAnnotations(fileId);
        if (saved.length) {
          const serialized = saved.map((row) => row.payload).filter(Boolean);
          if (serialized.length) annotation.state.restoreAnnotations(serialized as never);
        }
        setLoading(false);
      } catch (e) { if (!cancelled) { setError(e instanceof Error ? e.message : "Unable to initialize DICOM viewer"); setLoading(false); } }
    })();
    return () => { cancelled = true; try { ToolGroupManager.destroyToolGroup(toolGroupId); } catch {} try { engineRef.current?.destroy(); } catch {} engineRef.current = null; };
  }, [fileId]);

  useEffect(() => {
    const group = ToolGroupManager.getToolGroup(`medical-file-tools-${fileId}`);
    if (!group) return;
    group.setToolPassive(ZoomTool.toolName, { removeAllBindings: true });
    group.setToolPassive(PanTool.toolName, { removeAllBindings: true });
    group.setToolPassive(WindowLevelTool.toolName, { removeAllBindings: true });
    group.setToolPassive(LengthTool.toolName, { removeAllBindings: true });
    const name = tool === "zoom" ? ZoomTool.toolName : tool === "length" ? LengthTool.toolName : WindowLevelTool.toolName;
    group.setToolActive(name, { bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }] });
  }, [tool, fileId]);

  async function saveAnnotations() {
    setSaving(true); setError(null);
    try {
      const annotations = annotation.state.getAllAnnotations();
      for (const item of annotations) await saveMedicalAnnotation({ fileId, annotationType: item.metadata?.toolName ?? "annotation", payload: item as unknown as Record<string, unknown> });
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save annotations"); }
    finally { setSaving(false); }
  }

  return <section className="rounded-xl border bg-black p-2 text-white"><div className="mb-2 flex items-center gap-2"><button type="button" className={`rounded px-2 py-1 text-xs ${tool === "zoom" ? "bg-white/20" : "bg-white/5"}`} onClick={() => setTool("zoom")}><ZoomIn className="mr-1 inline h-3 w-3" />Zoom</button><button type="button" className={`rounded px-2 py-1 text-xs ${tool === "length" ? "bg-white/20" : "bg-white/5"}`} onClick={() => setTool("length")}><Ruler className="mr-1 inline h-3 w-3" />Measure</button><button type="button" className={`rounded px-2 py-1 text-xs ${tool === "window" ? "bg-white/20" : "bg-white/5"}`} onClick={() => setTool("window")}>Window/Level</button><button type="button" className="mr-auto rounded bg-white/10 px-2 py-1 text-xs" onClick={() => void saveAnnotations()} disabled={saving}><Save className="mr-1 inline h-3 w-3" />{saving ? "Saving…" : "Save annotations"}</button></div><div className="relative min-h-[420px] w-full overflow-hidden rounded bg-black">{loading && <div className="absolute inset-0 z-10 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}{error ? <div className="p-4 text-sm text-red-300">{error}</div> : <div ref={elementRef} className="h-[420px] w-full" />}</div></section>;
}
