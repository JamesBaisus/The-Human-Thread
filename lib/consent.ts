/**
 * Cookie/storage consent — the visitor's answer to the first-visit banner.
 *
 * The choice itself is kept in localStorage (storing a consent decision is
 * "strictly necessary" and allowed without consent). What it governs:
 *   - reading memory (lib/reading.ts) is opt-in: off until accepted.
 *   - Vercel Analytics is cookieless and anonymous, so it runs by default,
 *     but declining switches it off too — a "decline" should mean something.
 */

export type Consent = "accepted" | "declined";

const KEY = "tht:consent";

/** Fired on window whenever the choice changes, so mounted UI can react. */
export const CONSENT_EVENT = "tht:consent-changed";

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* storage unavailable — the banner will simply ask again next visit */
  }
  try {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    /* no-op outside the browser */
  }
}

/** Reading memory is opt-in: only once the visitor has accepted. */
export function readingAllowed(): boolean {
  return getConsent() === "accepted";
}

/** Cookieless analytics stay on unless the visitor explicitly declines. */
export function analyticsAllowed(): boolean {
  return getConsent() !== "declined";
}
