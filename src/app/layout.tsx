// src/app/layout.tsx
// Root layout — required by Next.js App Router.
// M2.6: Reads tenant direction from cookie for SSR RTL/LTR support.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@/shared/components/QueryClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicSaaS",
  description: "ClinicSaaS Multi-Tenant Platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // M2.6: Read direction from cookie set by client-side DirectionProvider
  // Fallback to "rtl" for Arabic default
  const cookieStore = await cookies();
  const direction = (cookieStore.get("tenant-direction")?.value ?? "rtl") as "rtl" | "ltr";
  const language = (cookieStore.get("tenant-language")?.value ?? "ar") as "ar" | "en";

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
