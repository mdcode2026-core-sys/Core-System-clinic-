"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { markHomeWelcomeSeen } from "./homeWelcome";

interface HomeWorkspaceTransitionLinkProps { compact?: boolean; }

export function HomeWorkspaceTransitionLink({ compact = false }: HomeWorkspaceTransitionLinkProps) {
  const { locale } = useI18n();
  const isArabic = locale === "ar";
  const [started, setStarted] = useState(false);
  return (
    <Link href="/workspace" aria-label={isArabic ? "الانتقال إلى مساحة العمل" : "Enter Workspace"} aria-busy={started} onClick={() => { markHomeWelcomeSeen(); setStarted(true); }} className={`cs-interactive inline-flex ${compact ? "h-9 px-3" : "h-10 px-4"} shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--cs-azure-600)] text-sm font-semibold text-white shadow-[var(--cs-shadow-xs)] hover:bg-[var(--cs-azure-700)]`}>
      {started ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
      {started ? (isArabic ? "جارٍ فتح مساحة العمل" : "Entering Workspace") : (isArabic ? "فتح مساحة العمل" : "Open Workspace")}
      <span className="sr-only" aria-live="polite">{started ? (isArabic ? "الانتقال إلى مساحة العمل" : "Entering Workspace") : ""}</span>
    </Link>
  );
}
