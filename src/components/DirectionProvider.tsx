"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { I18nProvider } from "@/core/i18n/I18nProvider";
import type { Locale } from "@/core/i18n/messages";

type Direction = "rtl" | "ltr";

interface DirectionContextType {
  direction: Direction;
  isLoading: boolean;
}

const DirectionContext = createContext<DirectionContextType>({ direction: "rtl", isLoading: true });

export function useDirection() {
  return useContext(DirectionContext);
}

function readInitialLocale(): Locale {
  if (typeof document === "undefined") return "ar";
  const cookie = document.cookie.match(/(?:^|; )tenant-language=(ar|en)(?:;|$)/)?.[1];
  const stored = window.localStorage.getItem("core-system-locale");
  return (cookie === "en" || stored === "en") ? "en" : "ar";
}

/**
 * Permanent language/direction foundation.
 * Tenant settings provide the default; an explicit local language choice is
 * preserved in the browser so every authorized user can work in either UI language.
 */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>("rtl");
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    async function loadLanguageAndDirection() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setIsLoading(false); return; }

      const { data: clinicUser } = await supabase
        .from("clinic_users")
        .select("tenant_id")
        .eq("auth_user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      const tenantId = clinicUser?.tenant_id;
      if (!tenantId) { setIsLoading(false); return; }

      const { data } = await supabase
        .from("master_tenants")
        .select("direction, language")
        .eq("id", tenantId)
        .limit(1)
        .maybeSingle();

      const tenantLocale = (data?.language as Locale) === "en" ? "en" : "ar";
      const browserLocale = readInitialLocale();
      const hasExplicitChoice = document.cookie.includes("tenant-language=") || !!window.localStorage.getItem("core-system-locale");
      const nextLocale = hasExplicitChoice ? browserLocale : tenantLocale;
      const nextDirection: Direction = nextLocale === "en" ? "ltr" : "rtl";

      setLocale(nextLocale);
      setDirection(nextDirection);
      document.documentElement.dir = nextDirection;
      document.documentElement.lang = nextLocale;
      document.cookie = `tenant-direction=${nextDirection}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `tenant-language=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      setIsLoading(false);
    }

    loadLanguageAndDirection();
  }, []);

  return (
    <DirectionContext.Provider value={{ direction, isLoading }}>
      <I18nProvider initialLocale={locale}>{children}</I18nProvider>
    </DirectionContext.Provider>
  );
}
