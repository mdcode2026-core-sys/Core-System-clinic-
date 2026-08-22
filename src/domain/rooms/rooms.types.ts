import type { Database } from "@/infrastructure/supabase/database.types";

export type ClinicRoom = Database["public"]["Tables"]["clinic_rooms"]["Row"];
export type ClinicRoomInsert = Database["public"]["Tables"]["clinic_rooms"]["Insert"];
export type ClinicRoomUpdate = Database["public"]["Tables"]["clinic_rooms"]["Update"];

export const ROOM_TYPE_OPTIONS = [
  { value: "consultation", label: "استشارة", labelEn: "Consultation" },
  { value: "examination", label: "فحص", labelEn: "Examination Room" },
  { value: "treatment", label: "علاج", labelEn: "Treatment Room" },
  { value: "laser", label: "ليزر", labelEn: "Laser Room" },
  { value: "procedure", label: "إجراء", labelEn: "Procedure Room" },
  { value: "dental_chair", label: "كرسي أسنان", labelEn: "Dental Chair" },
  { value: "waiting", label: "انتظار", labelEn: "Waiting" },
  { value: "reception", label: "استقبال", labelEn: "Reception" },
] as const;

export type RoomTypeValue = typeof ROOM_TYPE_OPTIONS[number]["value"];

export interface RoomActionResult {
  success: boolean;
  error: string | null;
  data?: ClinicRoom;
}
