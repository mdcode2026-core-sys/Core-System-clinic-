const INTERNAL_PATH = /^\/(?!\/)[^\s]*$/;

/**
 * Notification producers may provide an already-authoritative internal path in
 * metadata.destination_path. The Header only accepts same-application paths;
 * it never derives a destination from notification copy or IDs.
 */
export function resolveNotificationDestination(value: string | null | undefined): string | null {
  if (!value || !INTERNAL_PATH.test(value)) return null;
  return value;
}
