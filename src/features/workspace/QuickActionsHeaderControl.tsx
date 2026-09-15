"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, MoreHorizontal } from "lucide-react";
import { LanguageSwitcher } from "@/core/i18n/LanguageSwitcher";

interface QuickActionsHeaderControlProps {
  isArabic: boolean;
  onSignOut: () => Promise<void>;
}

/**
 * Bounded global Header Quick Actions surface.
 * Initial scope is intentionally limited to approved global utilities:
 * language selection and logout. Business/domain actions must not be added
 * here without an explicit architecture decision.
 */
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

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleSignOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        aria-label={isArabic ? "الإجراءات السريعة" : "Quick actions"}
        aria-expanded={open}
        aria-controls="global-quick-actions-menu"
        aria-haspopup="menu"
        data-testid="quick-actions-header-control"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id="global-quick-actions-menu"
          role="menu"
          aria-label={isArabic ? "الإجراءات السريعة" : "Quick actions"}
          className="fixed inset-x-2 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[90] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl md:absolute md:inset-x-auto md:end-0 md:top-11"
          data-testid="quick-actions-menu"
        >
          <div className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {isArabic ? "إجراءات عامة" : "Global actions"}
          </div>

          <div role="menuitem" className="rounded-lg px-2 py-2 focus-within:bg-slate-50">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {isArabic ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
