// src/app/layout.tsx
// Root layout — required by Next.js App Router.

import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@/shared/components/QueryClientProvider";
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
    <html lang="en">
      <body>
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
