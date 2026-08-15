"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { SubscriptionInfo, SubscriptionStatus } from "./subscriptions.types";

const supabase = createClient();

function computeStatus(
  tier: string,
  endDate: string | null,
  trialStartedAt: string | null
): SubscriptionStatus {
  if (tier === "suspended") return "suspended";

  const now = new Date();

  if (trialStartedAt && !endDate) {
    const trialStart = new Date(trialStartedAt);
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 14); // default 14-day trial
    if (now > trialEnd) return "expired";
    return "trial";
  }

  if (endDate) {
    const end = new Date(endDate);
    if (now > end) return "expired";
    return "active";
  }

  return "trial";
}

function computeDaysRemaining(
  endDate: string | null,
  trialStartedAt: string | null
): number | null {
  const now = new Date();

  if (endDate) {
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  if (trialStartedAt) {
    const trialStart = new Date(trialStartedAt);
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 14);
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  return null;
}

export function useSubscriptionInfo(tenantId: string | null) {
  return useQuery({
    queryKey: ["subscription-info", tenantId],
    queryFn: async (): Promise<SubscriptionInfo | null> => {
      if (!tenantId) return null;

      // Fetch tenant data
      const { data: tenant, error: tenantError } = await supabase
        .from("master_tenants")
        .select(`
          id,
          clinic_name,
          clinic_name_ar,
          subscription_tier,
          license_key,
          subscription_start,
          subscription_end,
          trial_started_at
        `)
        .eq("id", tenantId)
        .limit(1)
        .maybeSingle();

      if (tenantError || !tenant) {
        console.error("[useSubscriptionInfo] tenant error:", tenantError?.message);
        return null;
      }

      // Fetch plan details from subscription_plans
      const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("plan_name, plan_name_ar, max_users, max_branches, max_devices, storage_gb")
        .eq("plan_key", tenant.subscription_tier)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (planError) {
        console.error("[useSubscriptionInfo] plan error:", planError.message);
      }

      const status = computeStatus(
        tenant.subscription_tier,
        tenant.subscription_end,
        tenant.trial_started_at
      );

      const daysRemaining = computeDaysRemaining(
        tenant.subscription_end,
        tenant.trial_started_at
      );

      return {
        tenantId: tenant.id,
        clinicName: tenant.clinic_name,
        clinicNameAr: tenant.clinic_name_ar,
        subscriptionTier: tenant.subscription_tier,
        subscriptionStatus: status,
        licenseKey: tenant.license_key,
        subscriptionStart: tenant.subscription_start,
        subscriptionEnd: tenant.subscription_end,
        trialStartedAt: tenant.trial_started_at,
        daysRemaining,
        planName: plan?.plan_name ?? tenant.subscription_tier,
        planNameAr: plan?.plan_name_ar ?? null,
        maxUsers: plan?.max_users ?? null,
        maxBranches: plan?.max_branches ?? null,
        maxDevices: plan?.max_devices ?? null,
        storageGb: plan?.storage_gb ?? null,
      };
    },
    enabled: !!tenantId,
  });
}
