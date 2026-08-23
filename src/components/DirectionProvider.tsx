"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import type { Locale } from "@/core/i18n/messages";

type Direction = "rtl" | "ltr";
interface DirectionContextType { direction: Direction; isLoading: boolean; }
const DirectionContext = createContext<DirectionContextType>({ direction: "rtl", isLoading: true });
export function useDirection() { return useContext(DirectionContext); }

function readUserLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie.match(/(?:^|; )core-system-locale=(ar|en)(?:;|$)/)?.[1];
  const stored = window.localStorage.getItem("core-system-locale");
  if (cookie === "en" || stored === "en") return "en";
  if (cookie === "ar" || stored === "ar") return "ar";
  return null;
}

/** Permanent bilingual foundation: tenant language is the default; user choice is local and persistent. */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>("rtl");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLanguageAndDirection() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setIsLoading(false); return; }
      const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", session.user.id).limit(1).maybeSingle();
      const tenantId = clinicUser?.tenant_id;
      if (!tenantId) { setIsLoading(false); return; }
      const { data } = await supabase.from("master_tenants").select("direction, language").eq("id", tenantId).limit(1).maybeSingle();
      const tenantLocale: Locale = data?.language === "en" ? "en" : "ar";
      const nextLocale = readUserLocale() ?? tenantLocale;
      const nextDirection: Direction = nextLocale === "en" ? "ltr" : data?.direction === "ltr" ? "ltr" : "rtl";
      setDirection(nextDirection);
      document.documentElement.dir = nextDirection;
      document.documentElement.lang = nextLocale;
      setIsLoading(false);
    }
    loadLanguageAndDirection();
  }, []);

  return <DirectionContext.Provider value={{ direction, isLoading }}>{children}</DirectionContext.Provider>;
}
