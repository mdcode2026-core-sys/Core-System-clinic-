import { LanguageSwitcher } from "@/core/i18n/LanguageSwitcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cs-page-canvas relative flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--cs-azure-600)]" aria-hidden="true" />
      <div className="absolute end-4 top-4 z-10 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
