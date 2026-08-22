"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { ClinicRoomInsert, ClinicRoomUpdate, RoomActionResult } from "./rooms.types";

async function resolveCaller() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw "Unauthorized";

  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) throw "Tenant resolution failed";

  return { user, tenantId: clinicUser.tenant_id };
}

async function requireSettingsUpdate(userId: string, tenantId: string) {
  const permissions = await getEffectivePermissions(userId, tenantId);
  if (!permissions.includes("settings:update" as any)) {
    throw "Permission denied: settings:update";
  }
}

function validateRoom(input: {
  room_name?: string | null;
  room_type?: string | null;
  floor_number?: number | null;
  capacity?: number | null;
}) {
  if (input.room_name !== undefined && !input.room_name?.trim()) {
    throw "Room name is required";
  }
  if (input.room_type !== undefined && !input.room_type) {
    throw "Room type is required";
  }
  if (input.floor_number !== undefined && input.floor_number !== null && (!Number.isInteger(input.floor_number) || input.floor_number < 0)) {
    throw "Floor number must be a non-negative integer";
  }
  if (input.capacity !== undefined && input.capacity !== null && (!Number.isInteger(input.capacity) || input.capacity < 1)) {
    throw "Capacity must be a positive integer";
  }
}

export async function createRoom(input: Omit<ClinicRoomInsert, "tenant_id">): Promise<RoomActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requireSettingsUpdate(user.id, tenantId);
    validateRoom(input);

    const { data, error } = await supabase
      .from("clinic_rooms")
      .insert({ ...input, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      console.error("[createRoom] error:", error.message);
      return { success: false, error: "Failed to create room" };
    }

    revalidatePath("/settings");
    revalidatePath("/agenda");
    return { success: true, data, error: null };
  } catch (error) {
    const message = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
    console.error("[createRoom] error:", message);
    return { success: false, error: message };
  }
}

export async function updateRoom(id: string, updates: ClinicRoomUpdate): Promise<RoomActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requireSettingsUpdate(user.id, tenantId);
    validateRoom(updates);

    const { data: existing } = await supabase
      .from("clinic_rooms")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!existing) return { success: false, error: "Room not found or access denied" };

    const { data, error } = await supabase
      .from("clinic_rooms")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      console.error("[updateRoom] error:", error.message);
      return { success: false, error: "Failed to update room" };
    }

    revalidatePath("/settings");
    revalidatePath("/agenda");
    return { success: true, data, error: null };
  } catch (error) {
    const message = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
    console.error("[updateRoom] error:", message);
    return { success: false, error: message };
  }
}

export async function toggleRoomActive(id: string, isActive: boolean): Promise<RoomActionResult> {
  return updateRoom(id, { is_active: isActive });
}
