"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const loadUnread = async () => {
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

      const { data: conversations } = await supabase
        .from("communication_conversations")
        .select("id")
        .eq("tenant_id", clinicUser.tenant_id)
        .eq("kind", "internal")
        .neq("status", "archived")
        .limit(200);
      const conversationIds = (conversations ?? []).map((c) => c.id);
      if (!conversationIds.length) {
        if (active) setUnread(0);
        return;
      }

      const { data: messages } = await supabase
        .from("communication_messages")
        .select("id,sender_clinic_user_id,conversation_id")
        .eq("tenant_id", clinicUser.tenant_id)
        .in("conversation_id", conversationIds)
        .eq("message_kind", "message")
        .neq("sender_clinic_user_id", clinicUser.id)
        .order("created_at", { ascending: false })
        .limit(200);
      const ids = (messages ?? []).map((m) => m.id);
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
    const refresh = () => { void loadUnread(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const interval = window.setInterval(loadUnread, 10000);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(interval);
    };
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
