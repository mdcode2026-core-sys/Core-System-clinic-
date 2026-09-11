"use client";

import { useState } from "react";
import { LogOut, MoreHorizontal } from "lucide-react";
import { LanguageSwitcher } from "@/core/i18n/LanguageSwitcher";

interface QuickActionsHeaderControlProps {
  isArabic: boolean;
  onSignOut: () => Promise<void>;
}

/**
 * Bounded global Header Quick Actions surface.
 *
 * Initial scope is intentionally limited to approved global utilities:
 * language selection and logout. Business/domain actions must not be added
 * here without an explicit architecture decision.
 */
export function QuickActionsHeaderControl({
  isArabic,
  onSignOut,
}: QuickActionsHeaderControlProps) {
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={isArabic ? "الإجراءات السريعة" : "Quick actions"}
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="quick-actions-header-control"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={isArabic ? "الإجراءات السريعة" : "Quick actions"}
          className="absolute end-0 top-12 z-50 min-w-56 rounded-xl border bg-white p-2 shadow-xl"
          data-testid="quick-actions-menu"
        >
          <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {isArabic ? "إجراءات عامة" : "Global actions"}
          </div>

          <div role="menuitem" className="rounded-lg px-2 py-2 focus-within:bg-gray-50">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {isArabic ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
