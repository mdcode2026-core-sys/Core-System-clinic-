export type MedicalFileKind = "image" | "document" | "dicom" | "video" | "audio" | "archive" | "other";
export type MedicalFileStatus = "pending" | "available" | "processing" | "failed" | "archived";
export type MedicalStorageProvider = "cloud" | "local" | "hybrid";

export interface MedicalFile {
  id: string;
  tenant_id: string;
  patient_id: string | null;
  visit_id: string | null;
  parent_file_id: string | null;
  file_kind: MedicalFileKind;
  original_filename: string;
  mime_type: string | null;
  extension: string | null;
  size_bytes: number;
  checksum_sha256: string | null;
  storage_provider: MedicalStorageProvider;
  storage_path: string | null;
  storage_status: MedicalFileStatus;
  availability: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface MedicalFileContext {
  tenantId?: string;
  patientId?: string;
  visitId?: string;
}
