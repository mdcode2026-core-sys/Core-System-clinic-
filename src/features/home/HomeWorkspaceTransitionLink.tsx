"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";

interface HomeWorkspaceTransitionLinkProps {
  compact?: boolean;
}

export function HomeWorkspaceTransitionLink({ compact = false }: HomeWorkspaceTransitionLinkProps) {
  const { locale } = useI18n();
  const isArabic = locale === "ar";
  const [pending, startTransition] = useTransition();
  const [started, setStarted] = useState(false);

  return (
    <Link
      href="/workspace"
      aria-label={isArabic ? "الانتقال إلى مساحة العمل" : "Enter Workspace"}
      aria-busy={pending || started}
      onClick={(event) => {
        if (pending || started) {
          event.preventDefault();
          return;
        }
        setStarted(true);
        startTransition(() => {});
      }}
      className={`cs-interactive inline-flex ${compact ? "h-9 px-3" : "h-10 px-4"} shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--cs-azure-600)] text-sm font-semibold text-white shadow-[var(--cs-shadow-xs)] hover:bg-[var(--cs-azure-700)]`}
    >
      {(pending || started) ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
      {pending || started ? (isArabic ? "جارٍ فتح مساحة العمل" : "Entering Workspace") : (isArabic ? "فتح مساحة العمل" : "Open Workspace")}
      <span className="sr-only" aria-live="polite">{pending || started ? (isArabic ? "الانتقال إلى مساحة العمل" : "Entering Workspace") : ""}</span>
    </Link>
  );
}
