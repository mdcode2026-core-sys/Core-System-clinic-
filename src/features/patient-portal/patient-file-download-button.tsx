"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { createPatientMedicalFileDownloadUrl } from "@/domain/patient-portal/patient-file.actions";

export function PatientFileDownloadButton({ medicalFileId }: { medicalFileId: string }) {
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const url = await createPatientMedicalFileDownloadUrl(medicalFileId);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }
  return <Button variant="outline" size="sm" onClick={download} disabled={busy}>{busy ? "Opening…" : "Open file"}</Button>;
}
