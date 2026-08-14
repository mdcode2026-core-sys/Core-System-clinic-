"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";

type Direction = "rtl" | "ltr";

interface DirectionContextType {
  direction: Direction;
  isLoading: boolean;
}

const DirectionContext = createContext<DirectionContextType>({
  direction: "rtl",
  isLoading: true,
});

export function useDirection() {
  return useContext(DirectionContext);
}

/**
 * DirectionProvider — M2.6
 *
 * Reads the tenant's direction preference from master_tenants and:
 * 1. Sets document.documentElement.dir (for CSS/Tailwind RTL)
 * 2. Sets a cookie "tenant-direction" (for SSR in RootLayout)
 * 3. Provides direction context to child components
 *
 * This is the SINGLE source of truth for RTL/LTR in the application.
 * Do NOT add local dir="rtl" hacks in individual components.
 */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>("rtl");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDirection() {
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      // Resolve tenant_id from clinic_users (canonical pattern)
      const { data: clinicUser } = await supabase
        .from("clinic_users")
        .select("tenant_id")
        .eq("auth_user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      const tenantId = clinicUser?.tenant_id;
      if (!tenantId) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("master_tenants")
        .select("direction, language")
        .eq("id", tenantId)
        .limit(1)
        .maybeSingle();

      const dir = (data?.direction as Direction) ?? "rtl";
      const lang = (data?.language as "ar" | "en") ?? "ar";

      setDirection(dir);

      // Apply to DOM immediately
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;

      // Set cookie for SSR (RootLayout reads this on next request)
      document.cookie = `tenant-direction=${dir}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `tenant-language=${lang}; path=/; max-age=86400; SameSite=Lax`;

      setIsLoading(false);
    }

    loadDirection();
  }, []);

  return (
    <DirectionContext.Provider value={{ direction, isLoading }}>
      {children}
    </DirectionContext.Provider>
  );
}
