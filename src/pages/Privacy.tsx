import { PageShell, PageFooterLinks } from "../components/Shell";

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <PageShell>
        <section aria-labelledby="privacy-title">
          <div className="eyebrow">Legal</div>
          <h1 id="privacy-title" className="display mt-3 text-[clamp(2.4rem,5vw,4.4rem)] text-soft">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-titanium/70">
            This policy explains how we treat information when you use the SUTRA concept website. The SUTRA product described
            on this site is a <strong className="text-soft">conceptual exploration</strong> and is not a currently available product.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-data-title">
          <h2 id="privacy-data-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Information we collect</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            The SUTRA website is a static, interactive product experience. For most visits, no personal information is collected.
            When you use optional features such as the early-access signup or the contact form, we only process the information you
            choose to provide — typically an email address and a short message. No biometric, DNA, skin, or health information is
            collected or stored. SUTRA is a molecular-memory concept; this website does <strong className="text-soft">not</strong>{" "}
            analyze or store any biological material from you.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-why-title">
          <h2 id="privacy-why-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Why we collect it</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            When you provide an email address, it is used only to respond to your message or to send the project updates you
            requested. We do not sell personal information and we do not profile you based on sensitive categories. Information is
            deleted when no longer needed for its stated purpose.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-cookies-title">
          <h2 id="privacy-cookies-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Cookies &amp; similar technologies</h2>
          <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-titanium/75">
            <p>
              A small number of strictly-necessary local preferences are stored in your browser (for example, your reduced-motion
              preference and your analytics consent). If analytics are enabled, an analytics provider may process limited usage
              information — only after you give consent via the banner, and you can change that choice at any time.
            </p>
            <p>
              You can also clear these preferences in your browser settings. Disabling them may affect some interactive features,
              but the SUTRA story remains fully readable without them.
            </p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="privacy-third-title">
          <h2 id="privacy-third-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Third-party services</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            With consent, usage information may be processed by a privacy-respecting analytics provider to understand how people
            move through the experience. It is not used to identify you individually. External links are provided for educational
            purposes; we are not responsible for the privacy practices of other sites.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-security-title">
          <h2 id="privacy-security-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Data security</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            We use reasonable safeguards to protect information you provide through forms. No system can be guaranteed 100% secure,
            but we follow current best practice for the limited data we handle.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-retention-title">
          <h2 id="privacy-retention-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Retention &amp; your rights</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            We retain personal information only as long as necessary to fulfill its purpose, or as required by law. Depending on your
            location, you may have rights to access, correct, export, restrict, or delete information about you. You can exercise
            these rights via the <a className="underline hover:text-soft" href="#/contact">contact form</a>. Where applicable, you may
            also lodge a complaint with a data protection authority.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-kids-title">
          <h2 id="privacy-kids-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Children</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            This website is not directed at children. If you are under the applicable age of consent and provided information by
            mistake, contact us and we will take reasonable steps to delete it.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="privacy-changes-title">
          <h2 id="privacy-changes-title" className="display text-[clamp(1.4rem,3vw,2.2rem)] text-soft">Changes &amp; contact</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-titanium/75">
            We may update this policy; the current version is always shown here. Questions, requests, or deletion requests can be
            sent via the <a className="underline hover:text-soft" href="#/contact">contact page</a>.
          </p>
          <p className="mt-5 text-xs text-titanium/50">
            Effective date: February 2026. SUTRA is a conceptual product vision and is not a currently available product or service.
          </p>
        </section>

        <PageFooterLinks current="Privacy Policy" />
      </PageShell>
    </div>
  );
};
