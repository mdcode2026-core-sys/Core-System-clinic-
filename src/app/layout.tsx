import type { Metadata } from "next";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { RealtimeProvider } from "@/core/realtime/RealtimeProvider";
import { QueryClientProvider } from "@/shared/components/QueryClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicSaaS™ — نظام إدارة العيادات",
  description: "نظام إدارة عيادات متكامل متعدد المستأجرين",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryClientProvider>
          <AuthProvider>
            <RealtimeProvider>
              {children}
            </RealtimeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
