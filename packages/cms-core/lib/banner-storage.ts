export type BannerFrequency = "ALWAYS" | "ONCE_PER_SESSION" | "DONT_SHOW_AGAIN";

const storageKey = (id: string) => `banner_dismissed_${id}`;

function storageFor(frequency: BannerFrequency): Storage | null {
  if (typeof window === "undefined") return null;
  if (frequency === "DONT_SHOW_AGAIN") return window.localStorage;
  if (frequency === "ONCE_PER_SESSION") return window.sessionStorage;
  return null;
}

export function isBannerDismissed(id: string, frequency: BannerFrequency): boolean {
  const storage = storageFor(frequency);
  if (!storage) return false;
  try {
    return storage.getItem(storageKey(id)) === "1";
  } catch {
    return false;
  }
}

export function markBannerDismissed(id: string, frequency: BannerFrequency): void {
  const storage = storageFor(frequency);
  if (!storage) return;
  try {
    storage.setItem(storageKey(id), "1");
  } catch {
    // Storage unavailable (private browsing, quota) — fail silently, non-critical.
  }
}
