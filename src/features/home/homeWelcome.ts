export const HOME_WELCOME_SEEN_KEY = "core-system-home-welcome-seen";

export function markHomeWelcomeSeen() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(HOME_WELCOME_SEEN_KEY, "1");
  } catch {
    // Storage may be unavailable; navigation still proceeds normally.
  }
}
