"use client";

/**
 * M2.8 — Subscription Center Types
 *
 * Reads from master_tenants + subscription_plans.
 * No parallel subscription table created.
 */

export type SubscriptionStatus = "trial" | "active" | "expired" | "suspended";

export interface SubscriptionInfo {
  tenantId: string;
  clinicName: string;
  clinicNameAr: string | null;
  subscriptionTier: string;
  subscriptionStatus: SubscriptionStatus;
  licenseKey: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  trialStartedAt: string | null;
  daysRemaining: number | null;
  planName: string | null;
  planNameAr: string | null;
  maxUsers: number | null;
  maxBranches: number | null;
  maxDevices: number | null;
  storageGb: number | null;
}

export interface ActivationCodeResult {
  success: boolean;
  error: string | null;
  message?: string;
}

export interface ExternalLinksConfig {
  plansPricingUrl: string | null;
  subscriptionRequestsUrl: string | null;
  technicalSupportUrl: string | null;
}

// Temporary contact info — centralized, not scattered
export const TEMPORARY_CONTACT = {
  phone: "+962786595990",
  whatsapp: "+962786595990",
  email: "mdcode2026@gmail.com",
} as const;
