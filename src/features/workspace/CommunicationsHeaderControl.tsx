"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface CommunicationsHeaderControlProps {
  isArabic: boolean;
}

/**
 * Header gateway into the tenant-wide Communications domain.
 *
 * Communications is a common clinic domain surface. The Header therefore does
 * not hide it behind a communications:read permission. Action-level permissions
 * remain enforced by the Communications domain and server-side authorization.
 */
export function CommunicationsHeaderControl({
  isArabic,
}: CommunicationsHeaderControlProps) {
  return (
    <Link
      href="/communications"
      prefetch
      className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 md:px-3"
      aria-label={isArabic ? "الاتصالات" : "Communications"}
      title={isArabic ? "الاتصالات" : "Communications"}
      data-testid="global-header-communications"
    >
      <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
      <span className="hidden xl:inline">{isArabic ? "الاتصالات" : "Communications"}</span>
    </Link>
  );
}
