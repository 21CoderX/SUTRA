import { PageShell, PageFooterLinks } from "../components/Shell";

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <PageShell>
        <section aria-labelledby="terms-title">
          <div className="eyebrow">Legal</div>
          <h1 id="terms-title" className="display mt-3 text-[clamp(2.4rem,5vw,4.4rem)] text-soft">Terms of Use</h1>
          <p className="mt-4 max-w-3xl text-titanium/70">
            By using the SUTRA website, you accept these terms. The site is a conceptual product experience. The SUTRA product
            described here is a <strong className="text-soft">conceptual exploration</strong> and is not a currently available product or
            service. Nothing on this site creates an offer to sell a product.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-accuracy-title">
          <h2 id="terms-accuracy-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Accuracy of information</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            Information is provided for educational and illustrative purposes. While we aim for accuracy, no warranty is made that
            everything is complete or error-free; the scientific and technological areas referenced here are evolving. Features
            described as future targets, visions, or conceptual designs are not current product specifications.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-no-promise-title">
          <h2 id="terms-no-promise-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">No promise of availability</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            The SUTRA ring as described is a conceptual vision. There is no promise that any feature will ever be realized, will be
            realized in the form shown, or will be commercialized. Features labeled future design target, research-based, or
            conceptual depend on scientific and engineering progress that has not yet occurred.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-images-title">
          <h2 id="terms-images-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Visual representations</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            Visuals are dramatizations and abstractions intended to explain a concept, and may simplify complex scientific processes
            for educational purposes. Capacity equivalents and other comparisons are illustrative, not exact specifications.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-ip-title">
          <h2 id="terms-ip-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Intellectual property</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            Unless otherwise noted, visuals and content are provided for reference and educational use. You may share links for
            non-commercial purposes with attribution. Do not reproduce or adapt content in a way that implies endorsement,
            affiliation, or that a real product exists when it does not.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-use-title">
          <h2 id="terms-use-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Your use of the site</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            Use the site responsibly and do not abuse interactive features or attempt to disrupt the experience. We may update,
            discontinue, or modify features without notice.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-liability-title">
          <h2 id="terms-liability-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Limitation of liability</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            To the extent permitted by law, we are not liable for any loss arising from your use of the site or reliance on its
            information, which is provided as a conceptual exploration rather than a product specification or professional advice.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="terms-misc-title">
          <h2 id="terms-misc-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Misc &amp; contact</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            These terms apply to the SUTRA website; features or pages with their own notices are also governed by those notices.
            Questions can be sent via the <a className="underline hover:text-soft" href="#/contact">contact page</a>.
          </p>
          <p className="mt-5 text-xs text-titanium/50">
            Effective date: February 2026. SUTRA is a conceptual product vision and is not a currently available product or service.
          </p>
        </section>

        <PageFooterLinks current="Terms of Use" />
      </PageShell>
    </div>
  );
};
