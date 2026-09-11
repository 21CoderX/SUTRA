/**
 * Minimal page shell for the public pages of SUTRA (legal, FAQ, contact,
 * early-access, 404). Keeps brand band + secondary navigation consistent and
 * lets visitors return to the 3D experience from anywhere.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-14 md:px-14 lg:px-24">
      <header className="flex flex-col gap-3">
        <a
          href="#/"
          className="mono text-[0.78rem] tracking-[0.45em] text-soft hover:text-white"
          aria-label="SUTRA — back to the story"
        >
          SUTRA
          <span className="mx-2 text-titanium/40" aria-hidden>·</span>
          <span className="text-titanium/70">The Thread of Memory</span>
        </a>
        <div className="hairline mx-auto max-w-5xl" aria-hidden />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm text-titanium/60" aria-label="Public pages">
          <a href="#/" className="hover:text-soft">Story</a>
          <a href="#/early-access" className="hover:text-soft">Early Access</a>
          <a href="#/faq" className="hover:text-soft">FAQ</a>
          <a href="#/contact" className="hover:text-soft">Contact</a>
          <a href="#/privacy" className="hover:text-soft">Privacy</a>
          <a href="#/terms" className="hover:text-soft">Terms</a>
        </nav>
      </header>
      <div className="mt-10 flex-1">{children}</div>
    </div>
  );
}

export function PageFooterLinks({ current }: { current?: string }) {
  const links: [string, string][] = [
    ["#/", "Back to story"],
    ["#/faq", "FAQ"],
    ["#/early-access", "Early Access"],
    ["#/contact", "Contact"],
    ["#/privacy", "Privacy Policy"],
    ["#/terms", "Terms of Use"],
  ];
  return (
    <nav className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/5 pt-6 text-sm" aria-label="More pages">
      {links
        .filter(([, label]) => !(current && label === current))
        .map(([href, label]) => (
          <a key={href + label} href={href} className="text-titanium/70 hover:text-soft">
            {label}
          </a>
        ))}
    </nav>
  );
}
