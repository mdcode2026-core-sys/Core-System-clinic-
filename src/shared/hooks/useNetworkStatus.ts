"use client";

import { useState, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  // Assume online during SSR; the client corrects this on hydration via
  // getSnapshot, without needing a state+effect round trip.
  return true;
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isSyncing, setIsSyncing] = useState(false);

  return { isOnline, isSyncing, setIsSyncing };
}
