import { useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentLevel } from "../lib/cookieConsent";
import { event } from "../lib/analytics";

/**
 * GDPR-style cookie/analytics consent. Shows a full banner on first visit;
 * afterwards collapses to a small pill so the choice can be revisited at any
 * time (as required for freely-given, withdrawable consent).
 */
export function ConsentBanner() {
  const [level, setLevel] = useState<ConsentLevel | "unset">("unset");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const initial = getConsent();
    setLevel(initial);
    setExpanded(initial === "unset");
  }, []);

  const choose = (next: ConsentLevel) => {
    setConsent(next);
    setLevel(next);
    setExpanded(false);
    event("consent_choice", "privacy", next);
  };

  const summary =
    level === "all" ? "Analytics on" : level === "essential" ? "Essential only" : level === "deny" ? "Analytics off" : "Cookie settings";

  if (expanded) {
    return (
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="consent-title"
        className="fixed inset-x-3 bottom-[78px] z-50 mx-auto max-w-xl md:bottom-5 md:left-auto md:right-5 md:top-auto"
        data-nodrag
      >
        <div className="glass anim-fadeUp rounded-lg p-5">
          <h2 id="consent-title" className="text-sm text-soft">Privacy &amp; analytics</h2>
          <p className="mt-2 text-xs leading-relaxed text-titanium/75">
            We use local storage for your accessibility preferences and, only with your permission, privacy-respecting analytics
            that never set tracking cookies and never collect personal data. Read the{" "}
            <a href="#/privacy" className="underline hover:text-soft">privacy policy</a>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn !px-4 !py-2 !text-[0.58rem]" onClick={() => choose("deny")}>
              Analytics off
            </button>
            <button className="btn !px-4 !py-2 !text-[0.58rem]" onClick={() => choose("essential")}>
              Essential only
            </button>
            <button className="btn solid !px-4 !py-2 !text-[0.58rem]" onClick={() => choose("all")}>
              Accept analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      data-nodrag
      aria-haspopup="dialog"
      aria-label={`Cookie and analytics preferences — ${summary}. Activate to change.`}
      className="glass fixed bottom-[78px] right-3 z-50 flex items-center gap-2 rounded-full px-3.5 py-2 mono text-[0.55rem] tracking-[0.22em] text-titanium/70 transition-colors hover:text-soft md:bottom-5 md:right-5"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${level === "all" ? "bg-accent" : "bg-titanium/40"}`} aria-hidden />
      {summary.toUpperCase()}
    </button>
  );
}
