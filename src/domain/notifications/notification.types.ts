"use client";

/**
 * M2.7 — Notification Preferences Types
 *
 * Channel-level preferences backed by tenant_notification_channel_prefs.
 * The existing schema supports: whatsapp, sms, email, in_app.
 */

export type NotificationChannel = "whatsapp" | "sms" | "email" | "in_app";

export interface ChannelPreference {
  id: string;
  tenant_id: string;
  channel: NotificationChannel;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateChannelPreferenceInput {
  channel: NotificationChannel;
  is_enabled: boolean;
}

export interface NotificationPreferenceActionResult {
  success: boolean;
  error: string | null;
}

export const CHANNEL_METADATA: Record<
  NotificationChannel,
  { labelAr: string; labelEn: string; descriptionAr: string; descriptionEn: string }
> = {
  whatsapp: {
    labelAr: "واتساب",
    labelEn: "WhatsApp",
    descriptionAr: "إرسال التنبيهات عبر تطبيق واتساب",
    descriptionEn: "Send notifications via WhatsApp",
  },
  sms: {
    labelAr: "رسائل نصية",
    labelEn: "SMS",
    descriptionAr: "إرسال التنبيهات عبر الرسائل النصية القصيرة",
    descriptionEn: "Send notifications via SMS",
  },
  email: {
    labelAr: "بريد إلكتروني",
    labelEn: "Email",
    descriptionAr: "إرسال التنبيهات عبر البريد الإلكتروني",
    descriptionEn: "Send notifications via Email",
  },
  in_app: {
    labelAr: "داخل التطبيق",
    labelEn: "In-App",
    descriptionAr: "عرض التنبيهات داخل لوحة التحكم",
    descriptionEn: "Show notifications inside the dashboard",
  },
};
