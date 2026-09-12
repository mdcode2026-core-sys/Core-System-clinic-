"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: clinicUser } = await supabase
        .from("clinic_users")
        .select("id,tenant_id")
        .eq("auth_user_id", user.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .maybeSingle();
      if (!clinicUser) return;
      const { data: messages } = await supabase
        .from("communication_messages")
        .select("id,sender_clinic_user_id")
        .eq("tenant_id", clinicUser.tenant_id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!messages?.length) {
        if (active) setUnread(0);
        return;
      }
      const ids = messages.filter((m) => m.sender_clinic_user_id !== clinicUser.id).map((m) => m.id);
      if (!ids.length) {
        if (active) setUnread(0);
        return;
      }
      const { data: receipts } = await supabase
        .from("communication_message_reads")
        .select("message_id")
        .eq("tenant_id", clinicUser.tenant_id)
        .eq("clinic_user_id", clinicUser.id)
        .in("message_id", ids);
      const readIds = new Set((receipts ?? []).map((r) => r.message_id));
      if (active) setUnread(ids.filter((id) => !readIds.has(id)).length);
    };
    void loadUnread();
    return () => { active = false; };
  }, []);

  return (
    <Link
      href="/communications"
      prefetch
      className="relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={isArabic ? "المحادثات" : "Chat"}
      title={isArabic ? "المحادثات" : "Chat"}
      data-testid="global-header-chat"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      <span className="hidden xl:inline">{isArabic ? "المحادثات" : "Chat"}</span>
      {unread > 0 && (
        <span
          className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white"
          aria-label={isArabic ? `${unread} غير مقروءة` : `${unread} unread`}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
