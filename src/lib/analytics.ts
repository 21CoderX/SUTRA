/**
 * Privacy-first analytics client.
 * - Fires only after the visitor grants analytics consent (see cookieConsent.ts).
 * - No cookies are written by this client and no personal data is collected.
 * - In development, events are logged to the console for verification.
 * - In production, replace the body of `emit()` with your provider call
 *   (e.g. Plausible, Umami, or a server endpoint collecting JSON).
 */
type Payload =
  | { type: "pageview"; path: string; referrer?: string }
  | { type: "event"; event: string; category?: string; label?: string; value?: number };

let enabled = false;

export function setAnalyticsEnabled(v: boolean) {
  enabled = v;
}

export function analyticsReady() {
  return enabled;
}

function emit(p: Payload) {
  if (!enabled) return;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[analytics]", JSON.stringify(p));
  }
  // Production hook point:
  // fetch("https://your-collector.example/collect", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(p),
  //   keepalive: true,
  // });
}

export function pageView(path: string) {
  emit({ type: "pageview", path, referrer: document.referrer || undefined });
}

export function event(name: string, category?: string, label?: string, value?: number) {
  emit({ type: "event", event: name, category, label, value });
}
