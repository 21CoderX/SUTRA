import { useState } from "react";
import { PageShell } from "../components/Shell";
import { event } from "../lib/analytics";

const FIELDS = [
  { id: "name", label: "Name", placeholder: "Your name (optional)", type: "text", required: false, autoComplete: "name" },
  { id: "email", label: "Email address", placeholder: "you@example.com", type: "email", required: true, autoComplete: "email" },
  { id: "subject", label: "Subject", placeholder: "About the concept", type: "text", required: true, autoComplete: "off" },
] as const;
type FieldId = (typeof FIELDS)[number]["id"];
type FormState = Record<FieldId, string>;

const EMPTY: FormState = { name: "", email: "", subject: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactPage = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldId, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const errors = {
    email: form.email && !EMAIL_RE.test(form.email.trim()) ? "Please enter a valid email address." : "",
    subject: touched.subject && !form.subject.trim() ? "Please add a short subject." : "",
  };
  const valid = EMAIL_RE.test(form.email.trim()) && form.subject.trim().length > 0;

  const update = (id: FieldId, value: string) => {
    setForm((f) => ({ ...f, [id]: value }));
    if (error) setError("");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, subject: true });
    if (!valid) {
      setError("Please correct the highlighted fields and try again.");
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
    };
    try {
      // Hook point for a real endpoint. In this static demo a failed POST
      // simply falls back to the client-side confirmation below.
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);
      await new Promise((r) => setTimeout(r, 700));
      event("contact_submit", "form", payload.subject);
      setSubmitted(true);
      setForm(EMPTY);
      setTouched({});
    } catch {
      setError("Something went wrong. Please try again, or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <PageShell>
        <section>
          <div className="eyebrow">Get in touch</div>
          <h1 className="mt-3 display text-[clamp(2.4rem,5vw,4.4rem)] text-soft">Contact</h1>
          <p className="mt-4 max-w-3xl text-titanium/70">
            Ask a question, request an update about the concept, or flag something that should be clearer. We only use what you
            send to reply to you.
          </p>
        </section>

        <div className="mt-12 grid gap-10 md:grid-cols-2" aria-label="Contact form">
          <section>
            {submitted ? (
              <div role="status" className="glass rounded-md p-8 text-center anim-fadeUp">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-2xl text-accent" aria-hidden>✓</div>
                <h2 className="mt-5 text-2xl text-soft">Received.</h2>
                <p className="mt-2 text-sm text-titanium/70">
                  Thanks for writing. This is a concept site, so no email was actually sent in the demo — but the form validates and
                  submits exactly as a production one would.
                </p>
                <button
                  className="btn mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate aria-label="Contact form">
                {error && (
                  <div className="mb-4 rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300" role="alert">
                    {error}
                  </div>
                )}
                <div className="space-y-5">
                  {FIELDS.map((f) => {
                    const fieldError = (errors as Record<string, string>)[f.id];
                    const invalid = touched[f.id] && fieldError;
                    return (
                      <div key={f.id}>
                        <label htmlFor={`field-${f.id}`} className="mb-1.5 block text-sm text-titanium/80">
                          {f.label}
                          {f.required && (
                            <>
                              <span className="ml-1 text-red-400" aria-hidden>*</span>
                              <span className="sr-only"> (required)</span>
                            </>
                          )}
                        </label>
                        <input
                          id={`field-${f.id}`}
                          name={f.id}
                          type={f.type}
                          autoComplete={f.autoComplete}
                          className={`w-full rounded-md border bg-gunmetal px-4 py-3 text-soft placeholder-titanium/40 outline-none transition-colors focus:border-accent/60 ${
                            invalid ? "border-red-400/60" : "border-white/15"
                          }`}
                          placeholder={f.placeholder}
                          required={f.required}
                          aria-required={f.required}
                          aria-invalid={!!invalid}
                          aria-describedby={invalid ? `err-${f.id}` : undefined}
                          value={form[f.id]}
                          onChange={(e) => update(f.id, e.currentTarget.value)}
                          onBlur={() => setTouched((t) => ({ ...t, [f.id]: true }))}
                          disabled={loading}
                        />
                        {invalid && (
                          <p id={`err-${f.id}`} className="mt-1 text-xs text-red-300" aria-live="polite">
                            {fieldError}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <button type="submit" className="btn solid" disabled={loading} aria-busy={loading}>
                    {loading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-soft" aria-hidden />
                        Sending…
                      </>
                    ) : (
                      "Send message"
                    )}
                  </button>
                </div>
                <p className="mt-4 text-xs text-titanium/50">
                  This is a conceptual project website. No biometric or DNA information is requested or stored. See the{" "}
                  <a href="#/privacy" className="text-titanium underline hover:text-soft">privacy policy</a>.
                </p>
              </form>
            )}
          </section>

          <section>
            <div className="glass space-y-4 rounded-md p-6 text-sm text-titanium/75">
              <h2 className="text-sm uppercase tracking-[0.2em] text-soft">Before you send</h2>
              <p>If your question is about the concept, it may already be answered in the <a className="underline hover:text-soft" href="#/faq">FAQ</a>.</p>
              <p>Helpful context includes:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Which part of SUTRA you'd like to understand better</li>
                <li>Whether you're a curious reader, journalist, student or technologist</li>
                <li>Anything that feels unclear or overstated — we want the science honest</li>
              </ul>
              <p>You don't need to share sensitive information; we only ask what we need to reply.</p>
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/5 pt-6 text-sm">
          <a href="#/" className="text-titanium/70 hover:text-soft">← Back to story</a>
          <a href="#/faq" className="text-titanium/70 hover:text-soft">FAQ</a>
          <a href="#/early-access" className="text-titanium/70 hover:text-soft">Early Access</a>
          <a href="#/privacy" className="text-titanium/70 hover:text-soft">Privacy Policy</a>
          <a href="#/terms" className="text-titanium/70 hover:text-soft">Terms of Use</a>
        </div>
      </PageShell>
    </div>
  );
};
