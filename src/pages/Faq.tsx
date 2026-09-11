import { useState } from "react";
import { PageShell, PageFooterLinks } from "../components/Shell";
import { event } from "../lib/analytics";

const Q = [
  {
    q: "What is SUTRA?",
    a: "SUTRA is a proposed wearable molecular-memory ring — the idea of a ring that could archive your digital memories in synthetic DNA, while using a secure element, non-invasive wear sensing, and a wireless link to connect with your devices.",
  },
  {
    q: "What would be stored in it?",
    a: "Photos, videos, documents, knowledge, files and archives — the digital things you want to keep for a very long time. In the concept, they are encrypted, fragmented, protected with error correction, and then represented as DNA-compatible sequences inside the ring.",
  },
  {
    q: "Is SUTRA a real product I can buy today?",
    a: "No. The website presents SUTRA as a conceptual exploration and future engineering vision. We do not claim the ring exists commercially, that it currently stores a specific capacity, or that a consumer ring with integrated DNA write/read exists today.",
  },
  {
    q: "Does it use my body or my DNA to store or unlock my files?",
    a: "No. The concept uses non-invasive sensing and cryptographic authentication. It does not extract DNA from your skin, does not use your biological DNA as a key, and does not store your files in your body. The molecular archive is synthetic DNA inside the device.",
  },
  {
    q: "What is the 100 TB figure about?",
    a: "It is shown as a FUTURE DESIGN TARGET — a conceptual personal-archive capacity that illustrates why DNA storage is interesting. It is illustrative, not a current product specification. No current SUTRA ring stores 100 TB.",
  },
  {
    q: "Where is the data actually kept?",
    a: "In the concept, encrypted and error-corrected data is represented inside a protected molecular-storage chamber using synthetic DNA. A fast cache provides everyday access, while the DNA layer is intended as the long-term archive.",
  },
  {
    q: "How does it connect to my devices?",
    a: "The concept uses wireless connection — Bluetooth Low Energy and NFC for pairing and control, plus a conceptual higher-speed link for large transfers. No cable should be needed for normal use.",
  },
  {
    q: "Why DNA instead of a hard drive?",
    a: "DNA has an extraordinarily high theoretical information density and can be remarkably stable when stored cool, dry and protected, which makes it interesting for long-term archival. But synthesis is slow, sequencing is slower than electronic memory, random access is complex, error correction is required, and miniaturizing the hardware is a major challenge.",
  },
  {
    q: "Is DNA storage real?",
    a: "Yes — DNA data encoding, synthesis, sequencing, and digital-to-DNA representation are real areas of scientific research. What does not yet exist is a consumer-grade, ring-sized integrated writer and reader. That is the challenge SUTRA explores as a vision.",
  },
  {
    q: "Does the website actually synthesize DNA in my browser?",
    a: "No. The upload and retrieval flows are educational simulations of a pipeline. They show the steps a file would conceptually go through, but your browser does not synthesize DNA, sequence DNA, or store files in molecules.",
  },
  {
    q: "What is the demo mode?",
    a: "It walks through the whole concept as a cinematic presentation — ring appears, memory enters, data transforms, DNA encoding, archive, security, device connection, retrieval, and the final reveal. You can interrupt it at any time to explore manually.",
  },
  {
    q: "What is the cache for?",
    a: "The cache is a conventional fast working-memory layer for everyday access. The DNA layer is the long-term archive, not a swipe-through-photos medium. The cache is what makes the concept feel instant.",
  },
  {
    q: "Is the ring secure?",
    a: "In the concept, authentication combines physical possession, wearer verification, finger-position sensing and cryptographic protection. The ring is presented as a sealed, protected device that only opens for the registered wearer on the registered finger.",
  },
  {
    q: "How do you handle privacy and cookies?",
    a: "Analytics only run after you give consent via the cookie banner, and you can change that choice at any time. Form submissions are used only to reply to you. No biometric or DNA information is ever collected. Details are in the privacy policy.",
  },
  {
    q: "Can I request more information?",
    a: "Yes. Use the contact form to ask questions, or the early-access page to leave an email for future updates. We explain the concept honestly and never imply that a product is available when it is not.",
  },
];

export const FaqPage = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-obsidian text-soft">
      <PageShell>
        <section>
          <div className="eyebrow">Questions</div>
          <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4.4rem)] text-soft">Frequently asked questions</h1>
          <p className="mt-4 max-w-3xl text-titanium/70">Brief, honest answers about the concept behind the ring.</p>
        </section>

        <div className="mt-12 border-t border-white/5" role="list" aria-label="Frequently asked questions">
          {Q.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-white/5" role="listitem">
                <h2>
                  <button
                    id={`faq-q-${i}`}
                    className="flex w-full cursor-pointer items-start gap-4 py-7 text-left text-soft transition-colors hover:bg-soft/5"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => {
                      setOpen(isOpen ? null : i);
                      if (!isOpen) event("faq_open", "faq", item.q);
                    }}
                  >
                    <span className="flex-1">{item.q}</span>
                    <span className="mt-0.5 h-5 w-5 shrink-0 transition-transform duration-300" aria-hidden style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
                      <svg viewBox="0 0 24 24" className="h-full w-full text-titanium/70">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h2>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                  className="overflow-hidden px-1 pb-8 text-sm leading-relaxed text-titanium/70"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-md border border-white/5 bg-gunmetal/40 p-6">
          <h2 className="text-sm uppercase tracking-[0.2em] text-soft">Still curious?</h2>
          <p className="mt-2 text-sm text-titanium/70">
            Read the <a href="#/privacy" className="underline hover:text-soft">privacy policy</a>, or{" "}
            <a href="#/contact" className="underline hover:text-soft">ask directly</a>.
          </p>
        </div>

        <PageFooterLinks current="FAQ" />
      </PageShell>
    </div>
  );
};
