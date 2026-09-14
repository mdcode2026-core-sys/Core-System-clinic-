"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const HOME_WELCOME_SEEN_KEY = "core-system-home-welcome-seen";

interface HomeIdentityBannerProps {
  isArabic: boolean;
  clinicName: string;
  clinicLogoUrl?: string | null;
  displayName: string;
  hasWorkspace: boolean;
  weather: ReactNode;
}

export function HomeIdentityBanner({ isArabic, clinicName, clinicLogoUrl, displayName, hasWorkspace, weather }: HomeIdentityBannerProps) {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    setShowWelcome(sessionStorage.getItem(HOME_WELCOME_SEEN_KEY) !== "1");
  }, []);

  return (
    <section className="cs-surface-raised rounded-2xl p-4 sm:p-5" aria-labelledby="home-identity-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--cs-slate-200)] bg-white p-2">
            <Image
              src={clinicLogoUrl || "/brand/clinicsaas-header.svg"}
              alt={clinicLogoUrl ? clinicName : "ClinicSaaS™"}
              width={190}
              height={42}
              className="h-auto w-full object-contain"
              unoptimized={Boolean(clinicLogoUrl)}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-slate-500)]">{clinicName}</p>
            <h1 id="home-identity-title" className="mt-1 truncate text-xl font-bold tracking-tight text-[var(--cs-ink-950)] sm:text-2xl">
              {showWelcome ? (isArabic ? `مرحبًا ${displayName}` : `Welcome, ${displayName}`) : displayName}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--cs-slate-500)]">
              {showWelcome
                ? (isArabic ? "هذه هي نقطة الانطلاق لمعرفة ما يهمك اليوم." : "Your starting point for what matters today.")
                : (isArabic ? "تابع ما يهمك اليوم وانتقل مباشرة إلى العمل." : "Stay oriented to today and move directly into work.")}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-[42rem] lg:justify-end">
          {weather}
          {hasWorkspace ? <Link href="/workspace" className="cs-interactive inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--cs-azure-600)] px-4 text-sm font-semibold text-white shadow-[var(--cs-shadow-xs)] hover:bg-[var(--cs-azure-700)]">
            {isArabic ? "فتح مساحة العمل" : "Open Workspace"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link> : null}
        </div>
      </div>
    </section>
  );
}
