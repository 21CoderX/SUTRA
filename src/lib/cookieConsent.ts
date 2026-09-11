import { setAnalyticsEnabled } from "./analytics";

/**
 * Tiny consent store. The choice is persisted in localStorage.
 *  - deny:      no analytics, only strictly-necessary preferences
 *  - essential: same as deny for analytics (no third-party calls)
 *  - all:       privacy-respecting analytics enabled
 */
export type ConsentLevel = "deny" | "essential" | "all";

const KEY = "sutra_consent_v1";
let level: ConsentLevel | "unset" = "unset";

function readStored() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "deny" || raw === "essential" || raw === "all") level = raw;
  } catch {
    // storage unavailable — keep "unset" and show the banner
  }
}

function persist(next: ConsentLevel) {
  level = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // ignore
  }
  setAnalyticsEnabled(next === "all");
}

export function initConsent() {
  readStored();
  setAnalyticsEnabled(level === "all");
  // The router emits the initial pageview after consent is initialized.
}

export function getConsent(): ConsentLevel | "unset" {
  return level;
}

export function setConsent(next: ConsentLevel) {
  persist(next);
  // Analytics start fresh from the next router-driven pageview; the consent
  // choice itself is recorded separately via a consent_choice event.
}

export function hasAnalyticsConsent() {
  return level === "all";
}
