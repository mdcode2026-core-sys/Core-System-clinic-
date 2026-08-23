// src/app/layout.tsx
// Root layout — required by Next.js App Router.
// The tenant language is the default; core-system-locale is the user's persistent UI choice.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@/shared/components/QueryClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicSaaS",
  description: "ClinicSaaS Multi-Tenant Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const directionCookie = cookieStore.get("core-system-direction")?.value;
  const localeCookie = cookieStore.get("core-system-locale")?.value;
  const tenantDirection = cookieStore.get("tenant-direction")?.value;
  const tenantLanguage = cookieStore.get("tenant-language")?.value;

  const language = localeCookie === "en" || localeCookie === "ar"
    ? localeCookie
    : tenantLanguage === "en" || tenantLanguage === "ar" ? tenantLanguage : "ar";
  const direction = directionCookie === "ltr" || directionCookie === "rtl"
    ? directionCookie
    : language === "en" ? "ltr" : tenantDirection === "ltr" ? "ltr" : "rtl";

  return (
    <html lang={language} dir={direction}>
      <body>
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
