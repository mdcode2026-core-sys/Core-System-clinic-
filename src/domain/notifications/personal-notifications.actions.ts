"use server";

import { createClient } from "@/infrastructure/supabase/server";

async function resolveClinicUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, clinicUser: null };

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("id, tenant_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  return { supabase, user, clinicUser };
}

function isEligibleNotification(row: { scheduled_at?: string | null; created_at?: string | null; status?: string | null }, nowMs: number) {
  if (row.status === "failed" || row.status === "cancelled") return false;
  const effectiveAt = row.scheduled_at ?? row.created_at;
  return !effectiveAt || new Date(effectiveAt).getTime() <= nowMs;
}

export async function markNotificationRead(notificationId: string) {
  if (!notificationId) return { success: false, error: "Notification id is required" };

  const { supabase, clinicUser } = await resolveClinicUser();
  if (!clinicUser) return { success: false, error: "Unauthorized" };

  const { data: notification } = await supabase
    .from("notification_queue")
    .select("id,scheduled_at,created_at,status")
    .eq("id", notificationId)
    .eq("tenant_id", clinicUser.tenant_id)
    .eq("channel", "in_app")
    .eq("recipient_type", "clinic_user")
    .eq("recipient_id", clinicUser.id)
    .maybeSingle();

  if (!notification || !isEligibleNotification(notification, Date.now())) {
    return { success: false, error: "Notification not found" };
  }

  const { error } = await supabase.from("notification_queue_read_receipts").upsert(
    {
      tenant_id: clinicUser.tenant_id,
      notification_id: notification.id,
      clinic_user_id: clinicUser.id,
      read_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id,notification_id,clinic_user_id" },
  );

  if (error) {
    console.error("[markNotificationRead]", error.message);
    return { success: false, error: "Failed to mark notification as read" };
  }

  return { success: true, error: null };
}

export async function markAllNotificationsRead() {
  const { supabase, clinicUser } = await resolveClinicUser();
  if (!clinicUser) return { success: false, error: "Unauthorized" };

  const now = new Date();
  const { data: candidates, error: unreadError } = await supabase
    .from("notification_queue")
    .select("id,scheduled_at,created_at,status")
    .eq("tenant_id", clinicUser.tenant_id)
    .eq("channel", "in_app")
    .eq("recipient_type", "clinic_user")
    .eq("recipient_id", clinicUser.id)
    .not("status", "in", "(failed,cancelled)");

  if (unreadError) {
    console.error("[markAllNotificationsRead] load", unreadError.message);
    return { success: false, error: "Failed to load notifications" };
  }

  const eligible = (candidates ?? []).filter((row) => isEligibleNotification(row, now.getTime()));
  if (!eligible.length) return { success: true, error: null };

  const { data: alreadyRead, error: receiptError } = await supabase
    .from("notification_queue_read_receipts")
    .select("notification_id")
    .eq("tenant_id", clinicUser.tenant_id)
    .eq("clinic_user_id", clinicUser.id);

  if (receiptError) {
    console.error("[markAllNotificationsRead] receipts", receiptError.message);
    return { success: false, error: "Failed to load read state" };
  }

  const readIds = new Set((alreadyRead ?? []).map((row) => row.notification_id));
  const rows = eligible
    .filter((row) => !readIds.has(row.id))
    .map((row) => ({
      tenant_id: clinicUser.tenant_id,
      notification_id: row.id,
      clinic_user_id: clinicUser.id,
      read_at: now.toISOString(),
    }));

  if (!rows.length) return { success: true, error: null };

  const { error } = await supabase
    .from("notification_queue_read_receipts")
    .upsert(rows, { onConflict: "tenant_id,notification_id,clinic_user_id" });

  if (error) {
    console.error("[markAllNotificationsRead] write", error.message);
    return { success: false, error: "Failed to mark notifications as read" };
  }

  return { success: true, error: null };
}
