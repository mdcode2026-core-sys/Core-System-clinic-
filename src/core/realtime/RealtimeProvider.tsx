"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeContextType {
  queueChannel: RealtimeChannel | null;
  sessionChannel: RealtimeChannel | null;
}

const RealtimeContext = createContext<RealtimeContextType>({
  queueChannel: null,
  sessionChannel: null,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<RealtimeContextType>({
    queueChannel: null,
    sessionChannel: null,
  });

  useEffect(() => {
    const supabase = createClient();

    const queueChannel = supabase
      .channel("queue_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clinic_visit_sessions" },
        (payload) => {
          console.log("[Realtime] Queue update:", payload);
        }
      )
      .subscribe();

    const sessionChannel = supabase
      .channel("session_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clinic_visit_sessions" },
        (payload) => {
          console.log("[Realtime] Session update:", payload);
        }
      )
      .subscribe();

    setChannels({ queueChannel, sessionChannel });

    return () => {
      queueChannel.unsubscribe();
      sessionChannel.unsubscribe();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={channels}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
