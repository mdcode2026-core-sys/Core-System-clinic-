import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { QueryClientProvider } from "@/shared/components/QueryClientProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClinicSaaS",
  description: "Multi-Tenant Clinic Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <QueryClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
