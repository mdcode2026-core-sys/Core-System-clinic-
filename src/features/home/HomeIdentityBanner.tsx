"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import { HOME_WELCOME_SEEN_KEY } from "./homeWelcome";

interface HomeIdentityBannerProps {
  isArabic: boolean;
  clinicName: string;
  clinicLogoUrl?: string | null;
  displayName: string;
  weather: ReactNode;
}

function subscribeToHomeWelcome() {
  return () => undefined;
}

function getHomeWelcomeSnapshot() {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(HOME_WELCOME_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

function getHomeWelcomeServerSnapshot() {
  return true;
}

export function HomeIdentityBanner({ isArabic, clinicName, clinicLogoUrl, displayName, weather }: HomeIdentityBannerProps) {
  const showWelcome = useSyncExternalStore(subscribeToHomeWelcome, getHomeWelcomeSnapshot, getHomeWelcomeServerSnapshot);

  return (
    <section className="cs-surface-raised rounded-2xl p-4 sm:p-5" aria-labelledby="home-identity-title">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-center lg:gap-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--cs-slate-200)] bg-white p-2 sm:h-16 sm:w-16">
            <Image src={clinicLogoUrl || "/brand/clinicsaas-header.svg"} alt={clinicLogoUrl ? clinicName : "ClinicSaaS™"} width={190} height={42} className="h-auto w-full object-contain" unoptimized={Boolean(clinicLogoUrl)} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-slate-500)]">{clinicName}</p>
            <h1 id="home-identity-title" className="mt-1 truncate text-xl font-bold tracking-tight text-[var(--cs-ink-950)] sm:text-2xl">{showWelcome ? (isArabic ? `مرحبًا ${displayName}` : `Welcome, ${displayName}`) : displayName}</h1>
            <p className="mt-1 text-sm leading-6 text-[var(--cs-slate-500)]">{showWelcome ? (isArabic ? "نظرة سريعة على ما يهمك اليوم." : "A quick view of what matters today.") : (isArabic ? "تابع ما يهمك اليوم وانتقل مباشرة إلى العمل." : "Stay oriented to today and move directly into work.")}</p>
          </div>
        </div>
        <div className="min-w-0 lg:border-s lg:border-[var(--cs-slate-200)] lg:ps-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-slate-500)]">{isArabic ? "الموقع والطقس" : "Location & weather"}</div>
          <div className="min-w-0">{weather}</div>
        </div>
      </div>
    </section>
  );
}
