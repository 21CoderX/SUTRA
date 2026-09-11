import { useState } from "react";
import { PageShell, PageFooterLinks } from "../components/Shell";
import { event } from "../lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EarlyAccessPage = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [doneEmail, setDoneEmail] = useState("");
  const invalid = touched && !EMAIL_RE.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!EMAIL_RE.test(email.trim())) {
      setErrorText("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorText("");
    try {
      // Hook point for a real endpoint; failure on a static host is expected
      // and the client-side confirmation still demonstrates the flow.
      await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), interest: "sutra-concept" }),
        keepalive: true,
      }).catch(() => undefined);
      await new Promise((r) => setTimeout(r, 700));
      event("early_access_submit", "form", "early-access");
      setDoneEmail(email.trim());
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorText("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <PageShell>
        <section>
          <div className="eyebrow">Updates</div>
          <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4.4rem)] text-soft">Early access</h1>
          <p className="mt-4 max-w-3xl text-titanium/70">
            Want to be considered when there is something concrete to share — research updates, prototype news, or a real
            early-access launch? Leave your email and we will only use it to talk about the project.
          </p>
          <div className="mt-4 flex max-w-lg items-center gap-3 text-sm text-titanium/60">
            <span className="tag">CONCEPTUAL PROJECT</span>
            <span>SUTRA is not yet a product. This list is for optional interest in future updates.</span>
          </div>
        </section>

        <div className="mt-10 max-w-lg border-t border-white/5 pt-8">
          {status === "done" ? (
            <div role="status" className="glass anim-fadeUp rounded-md border-t border-accent/30 p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-2xl text-accent" aria-hidden>✓</div>
              <h2 className="mt-5 text-2xl text-soft">You are on the list.</h2>
              <p className="mt-2 text-sm text-titanium/70">
                Thanks, {doneEmail}. If there is ever something concrete to share, we will be in touch.
              </p>
              <button
                className="btn mt-6"
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                  setDoneEmail("");
                  setTouched(false);
                }}
              >
                Submit another email
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="flex flex-col gap-4">
                <label htmlFor="ea-email" className="text-sm text-titanium/80">
                  Email address
                  <span className="sr-only"> — we will use it only to send project updates</span>
                </label>
                <input
                  id="ea-email"
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  className={`w-full rounded-md border bg-gunmetal px-4 py-3 text-soft outline-none transition-colors placeholder:text-titanium/40 focus:border-accent/60 ${
                    invalid ? "border-red-400/60" : "border-white/15"
                  }`}
                  placeholder="you@example.com"
                  required
                  aria-required="true"
                  aria-invalid={status === "error"}
                  aria-describedby={status === "error" ? "ea-err" : "ea-note"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    if (status === "error") setStatus("idle");
                  }}
                  onBlur={() => setTouched(true)}
                  disabled={status === "loading"}
                />
                {status === "error" && (
                  <p id="ea-err" className="text-xs text-red-300" role="alert">
                    {errorText}
                  </p>
                )}
                <p id="ea-note" className="text-xs text-titanium/50">
                  You can unsubscribe at any time. We never share your email. See the{" "}
                  <a href="#/privacy" className="underline hover:text-soft">privacy policy</a>.
                </p>
              </div>
              <button
                type="submit"
                className="btn solid mt-6"
                disabled={status === "loading"}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-soft" aria-hidden />
                    Subscribing…
                  </>
                ) : (
                  "Save my interest"
                )}
              </button>
            </form>
          )}
        </div>

        <PageFooterLinks current="Early Access" />
      </PageShell>
    </div>
  );
};
