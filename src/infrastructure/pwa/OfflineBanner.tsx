"use client";

import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, isSyncing } = useNetworkStatus();

  if (isOnline && !isSyncing) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium ${
      isSyncing ? "bg-amber-500 text-white" : "bg-red-500 text-white"
    }`}>
      <WifiOff className="inline w-4 h-4 ml-2" />
      {isSyncing ? "جاري المزامنة..." : "أنت غير متصل. سيتم حفظ البيانات محلياً."}
    </div>
  );
}
