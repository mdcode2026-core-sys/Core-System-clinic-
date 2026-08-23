"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { MedicalFilesPanel } from "@/features/medical-files/ui/MedicalFilesPanel";

export function MedicalFilesWidget({ context }: WidgetComponentProps) {
  return <MedicalFilesPanel patientId={context?.patientId} visitId={context?.visitId} />;
}
