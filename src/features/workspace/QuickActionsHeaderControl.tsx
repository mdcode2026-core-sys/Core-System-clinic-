"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, MoreHorizontal } from "lucide-react";
import { LanguageSwitcher } from "@/core/i18n/LanguageSwitcher";

interface QuickActionsHeaderControlProps {
  isArabic: boolean;
  onSignOut: () => Promise<void>;
}

export function QuickActionsHeaderControl({ isArabic, onSignOut }: QuickActionsHeaderControlProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="cs-interactive inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--cs-slate-700)] sm:h-10 sm:w-10"
        aria-label={isArabic ? "الإجراءات السريعة" : "Quick actions"}
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="quick-actions-header-control"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open ? (
        <div role="menu" aria-label={isArabic ? "الإجراءات السريعة" : "Quick actions"} className="absolute end-0 top-11 z-50 min-w-56 rounded-xl border border-[var(--cs-slate-200)] bg-white p-2 shadow-[var(--cs-shadow-md)]" data-testid="quick-actions-menu">
          <div className="px-2.5 py-2 text-xs font-semibold text-[var(--cs-slate-500)]">{isArabic ? "إجراءات عامة" : "Global actions"}</div>
          <div role="menuitem" className="rounded-lg px-2 py-2"><LanguageSwitcher /></div>
          <button type="button" role="menuitem" onClick={handleSignOut} className="cs-interactive flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[var(--cs-slate-700)]">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {isArabic ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
