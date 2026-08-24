// src/app/layout.tsx
// Root layout — required by Next.js App Router.
// Tenant language may provide the initial locale; English is the global platform fallback.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@/shared/components/QueryClientProvider";
import { I18nProvider } from "@/core/i18n/I18nProvider";
import type { Locale } from "@/core/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicSaaS",
  description: "ClinicSaaS Multi-Tenant Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("core-system-locale")?.value;
  const tenantLanguage = cookieStore.get("tenant-language")?.value;

  const language: Locale = localeCookie === "en" || localeCookie === "ar"
    ? localeCookie
    : tenantLanguage === "en" || tenantLanguage === "ar" ? tenantLanguage : "en";
  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <html lang={language} dir={direction}>
      <body>
        <I18nProvider initialLocale={language}>
          <QueryClientProvider>
            {children}
          </QueryClientProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
