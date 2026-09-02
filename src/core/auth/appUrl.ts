const CANONICAL_PRODUCTION_URL = "https://core-system-clinic.vercel.app";

/**
 * Single source of truth for browser-facing authentication callbacks.
 * Production auth links must never depend on localhost or a preview deployment.
 */
export function getAppUrl(): string {
  if (process.env.VERCEL_ENV === "production") return CANONICAL_PRODUCTION_URL;

  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured?.trim()) return configured.trim().replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel?.trim()) return `https://${vercel.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
