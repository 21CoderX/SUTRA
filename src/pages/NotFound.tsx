import { PageShell, PageFooterLinks } from "../components/Shell";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <PageShell>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-32">
          <div className="eyebrow">404</div>
          <h1 className="display mt-4 text-[clamp(3rem,12vw,8rem)] text-soft">Page not found</h1>
          <p className="mt-4 max-w-md text-titanium/70">
            The page you asked for does not exist — or the link may be out of date.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#/" className="btn solid">Back to SUTRA</a>
            <a href="#/faq" className="btn">Read the FAQ</a>
            <a href="#/contact" className="btn">Contact</a>
          </div>
          <p className="mt-10 max-w-md text-xs text-titanium/50">
            SUTRA is a conceptual product exploration. If you believe you reached this page in error, use the contact page.
          </p>
          <div className="w-full max-w-md">
            <PageFooterLinks />
          </div>
        </div>
      </PageShell>
    </div>
  );
};
