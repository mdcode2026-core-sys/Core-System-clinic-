// src/app/layout.tsx
// Root layout — required by Next.js App Router (must render <html>/<body>).
//
// FIX: this file previously contained a verbatim copy of the Dashboard
// route-group layout (auth guard + <WorkspaceShell> wrapper), which is
// already correctly implemented in src/app/(dashboard)/layout.tsx.
// Duplicating that logic here broke every route in the app, including
// public routes like (auth)/login, and was missing the mandatory
// <html>/<body> tags required of a root layout.

import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicSaaS",
  description: "ClinicSaaS Multi-Tenant Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
