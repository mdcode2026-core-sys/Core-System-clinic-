"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeContextType {
  queueChannel: RealtimeChannel | null;
  sessionChannel: RealtimeChannel | null;
}

const EMPTY_CHANNELS: RealtimeContextType = {
  queueChannel: null,
  sessionChannel: null,
};

const RealtimeContext = createContext<RealtimeContextType>(EMPTY_CHANNELS);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // The channel handles are subscription instances, not UI state — nothing
  // should re-render when they're created. They're kept in a ref plus a
  // tiny external store so `useRealtime()` consumers can still read the
  // live value without the provider itself calling setState from an effect.
  const channelsRef = useRef<RealtimeContextType>(EMPTY_CHANNELS);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const getSnapshot = useCallback(() => channelsRef.current, []);
  const getServerSnapshot = useCallback(() => EMPTY_CHANNELS, []);

  useEffect(() => {
    const supabase = createClient();
    const listeners = listenersRef.current;

    const queueChannel = supabase
      .channel("queue_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clinic_visit_sessions" },
        () => {
          // Consumers subscribe to the channel directly for payload handling.
        }
      )
      .subscribe();

    const sessionChannel = supabase
      .channel("session_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clinic_visit_sessions" },
        () => {
          // Consumers subscribe to the channel directly for payload handling.
        }
      )
      .subscribe();

    channelsRef.current = { queueChannel, sessionChannel };
    listeners.forEach((listener) => listener());

    return () => {
      queueChannel.unsubscribe();
      sessionChannel.unsubscribe();
      channelsRef.current = EMPTY_CHANNELS;
      listeners.forEach((listener) => listener());
    };
  }, []);

  const channels = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <RealtimeContext.Provider value={channels}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
