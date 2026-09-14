"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const HOME_WELCOME_SEEN_KEY = "core-system-home-welcome-seen";

interface HomeIdentityBannerProps {
  isArabic: boolean;
  clinicName: string;
  displayName: string;
  hasWorkspace: boolean;
}

export function HomeIdentityBanner({ isArabic, clinicName, displayName, hasWorkspace }: HomeIdentityBannerProps) {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    setShowWelcome(sessionStorage.getItem(HOME_WELCOME_SEEN_KEY) !== "1");
  }, []);

  return (
    <section className="cs-surface-raised rounded-2xl p-5 sm:p-6" aria-labelledby="home-identity-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--cs-slate-200)] bg-white p-2">
            <Image src="/brand/clinicsaas-header.svg" alt="ClinicSaaS™" width={190} height={42} className="h-auto w-full" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-slate-500)]">{clinicName}</p>
            <h1 id="home-identity-title" className="mt-1 text-xl font-bold tracking-tight text-[var(--cs-ink-950)] sm:text-[1.5rem]">
              {showWelcome ? isArabic ? `مرحبًا ${displayName}` : `Welcome, ${displayName}` : displayName}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--cs-slate-500)]">
              {showWelcome
                ? isArabic ? "هذه هي نقطة الانطلاق لمعرفة ما يهمك اليوم." : "Your starting point for what matters today."
                : isArabic ? "هذه هي صفحتك الرئيسية لمتابعة ما يهمك اليوم." : "Your home for what matters today."}
            </p>
          </div>
        </div>
        {hasWorkspace ? (
          <Link href="/workspace" className="cs-interactive inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--cs-azure-600)] px-4 text-sm font-semibold text-white shadow-[var(--cs-shadow-xs)] transition-colors hover:bg-[var(--cs-azure-700)]">
            {isArabic ? "فتح مساحة العمل" : "Open Workspace"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
