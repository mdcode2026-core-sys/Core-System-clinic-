"use client";

import { createContext, useContext, useEffect } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";

type Direction = "rtl" | "ltr";
interface DirectionContextType { direction: Direction; isLoading: boolean; }
const DirectionContext = createContext<DirectionContextType>({ direction: "ltr", isLoading: false });
export function useDirection() { return useContext(DirectionContext); }

/** Compatibility context backed exclusively by the unified render-time I18nProvider. */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const direction: Direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [direction, locale]);

  return <DirectionContext.Provider value={{ direction, isLoading: false }}>{children}</DirectionContext.Provider>;
}
