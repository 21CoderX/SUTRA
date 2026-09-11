import { Section, Reveal, Eyebrow, Tag } from "./ui";
import { ShareRow } from "./Share";
import { useLocal } from "./Story";
import { event } from "../lib/analytics";

export function About() {
  return (
    <Section id="about" scene="about" height={180} align="left" label="Why SUTRA">
      <div className="max-w-xl">
        <Reveal>
          <Eyebrow>16 — ABOUT THE INVENTION</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-6 text-[clamp(2.4rem,6vw,5.2rem)] text-soft">Why SUTRA?</h2>
        </Reveal>
        <Reveal delay={200}>
          <blockquote className="mt-8 space-y-4 text-lg text-titanium/85 font-light leading-relaxed">
            <p>Today's digital memories are scattered across phones, computers, drives and cloud services.</p>
            <p>
              SUTRA explores a future where a person's most important digital memories could exist as a compact,
              physical molecular archive that they carry with them.
            </p>
          </blockquote>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 border-t border-titanium/15 pt-5">
            <div className="eyebrow">The objective</div>
            <p className="display mt-2 text-[clamp(1.4rem,2.6vw,2rem)] text-soft">Create a wearable interface to molecular storage.</p>
          </div>
        </Reveal>
        <Reveal delay={360}>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
            {[
              ["WHAT", "A proposed wearable molecular-memory device."],
              ["STORED", "Photos, videos, documents, knowledge, archives."],
              ["WHERE", "Synthetic DNA in a protected internal chamber."],
              ["ACCESS", "Companion app over a wireless link."],
              ["SECURITY", "Wearer + finger-position sensing + cryptography."],
              ["CACHE", "Fast working access; DNA is the archive."],
            ].map(([t, s]) => (
              <div key={t}>
                <div className="mono text-[0.6rem] tracking-[0.3em] text-accent/80">{t}</div>
                <div className="mt-1 text-xs text-titanium/70">{s}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

const STAGES = [
  ["01", "Concept", "Architecture, storytelling, threat model and honest scope.", "RESEARCH"],
  ["02", "DNA archive prototype", "Bench-scale: encode, synthesize, sequence and recover a personal archive with error correction.", "RESEARCH"],
  ["03", "Wearable hybrid archive", "A ring with secure element, sensors, cache and wireless link; DNA written and read off-device.", "PROTOTYPE"],
  ["04", "Miniaturized molecular hardware", "Shrinking synthesis and read-out toward wearable scale — the hard problem.", "FUTURE"],
  ["05", "Integrated SUTRA", "Write, store, read and verify inside the ring itself.", "FUTURE"],
];

export function Roadmap() {
  const l = useLocal(17, 12);
  const lit = Math.min(STAGES.length, Math.floor(l * 1.5 * STAGES.length) + 1);
  return (
    <Section id="future" scene="roadmap" height={200} align="right" label="Future roadmap">
      <div className="w-full max-w-2xl text-right">
        <Reveal>
          <Eyebrow>17 — ROADMAP</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft">From thread to ring.</h2>
        </Reveal>
        <ol className="mt-10 text-left" data-nodrag>
          {STAGES.map(([n, t, s, tag], i) => {
            const on = i < lit;
            return (
              <li key={n} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className={`display text-2xl tabular-nums transition-colors duration-700 ${on ? "text-soft" : "text-titanium/30"}`}>{n}</span>
                  {i < STAGES.length - 1 && <span className={`mt-2 w-px flex-1 transition-colors duration-700 ${on && i + 1 < lit ? "bg-accent/60" : "bg-titanium/15"}`} />}
                </div>
                <div className={`transition-opacity duration-700 ${on ? "opacity-100" : "opacity-40"}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg text-soft">{t}</span>
                    <Tag tone={tag === "FUTURE" ? "warn" : tag === "PROTOTYPE" ? "accent" : "default"}>{tag}</Tag>
                  </div>
                  <p className="mt-1 max-w-md text-sm text-titanium/65">{s}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-xs text-titanium/45">No dates are claimed. Stages 04 and 05 depend on scientific progress that has not yet happened.</p>
      </div>
    </Section>
  );
}

const OVERLAYS = ["MEMORY", "MOLECULES", "SECURITY", "WIRELESS", "ARCHIVE"];

export function Final({ onExplore, onArchitecture }: { onExplore: () => void; onArchitecture: () => void }) {
  const l = useLocal(18, 20);
  // phase 0: memories → 1: "digital" → 2: "physical?" → 3: overlays fade → 4: SUTRA
  const p = l * 5;
  const op = (a: number, b: number) => Math.max(0, Math.min(1, 1 - Math.abs(p - (a + b) / 2) / ((b - a) / 2)));
  return (
    <Section id="final" scene="final" height={360} label="Final reveal">
      <div className="relative flex h-full w-full flex-col items-center justify-center text-center">
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: op(0, 1.6) }}>
          <h2 className="display text-[clamp(2.4rem,6vw,5.4rem)] text-soft">Your memories are digital.</h2>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: op(1.4, 2.8) }}>
          <h2 className="display text-[clamp(2.4rem,6vw,5.4rem)] text-soft">What if they could become physical?</h2>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {OVERLAYS.map((o, i) => {
            const a = (i / OVERLAYS.length) * Math.PI * 2 - Math.PI / 2;
            const show = Math.max(0, Math.min(1, (p - 2.4) * 3)) * Math.max(0, 1 - Math.max(0, p - 3.1 - i * 0.14) * 4);
            return (
              <span key={o} className="absolute mono text-[0.62rem] tracking-[0.4em] text-titanium/80" style={{ opacity: show, transform: `translate(${Math.cos(a) * 34}vmin, ${Math.sin(a) * 26}vmin)` }}>
                {o}
              </span>
            );
          })}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: Math.max(0, Math.min(1, (p - 3.6) * 1.6)) }}>
          <h2 className="display text-[clamp(4rem,14vw,11rem)] text-soft" style={{ letterSpacing: "0.08em" }}>SUTRA</h2>
          <p className="display mt-2 text-[clamp(1.3rem,3vw,2.2rem)] text-titanium">The Thread of Memory.</p>
          <p className="mt-6 max-w-sm text-sm text-titanium/65">A vision for the future of personal digital memory.</p>
          <p className="mt-1 text-xs text-titanium/45">A conceptual vision for wearable molecular memory.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3" data-nodrag>
            <a
              href="#/early-access"
              className="btn solid"
              onClick={() => event("cta_click", "final", "early-access")}
            >
              Request early access
            </a>
            <button className="btn" onClick={onExplore}>
              Explore the technology
            </button>
            <button className="btn" onClick={onArchitecture}>
              View the architecture
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Footer() {
  const cols: { heading: string; links: [string, string, string?][] }[] = [
    {
      heading: "Explore",
      links: [
        ["Story", "#/"],
        ["How it works", "#how"],
        ["Technology", "#technology"],
        ["FAQ", "#/faq"],
      ],
    },
    {
      heading: "Project",
      links: [
        ["Early access", "#/early-access"],
        ["Contact", "#/contact"],
        ["Privacy policy", "#/privacy"],
        ["Terms of use", "#/terms"],
      ],
    },
  ];
  return (
    <footer className="relative z-10 border-t border-white/5 bg-obsidian/85 px-6 py-16 md:px-14 lg:px-24" aria-label="About this experience">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="mono text-[0.72rem] tracking-[0.4em] text-soft">SUTRA</div>
          <div className="mt-2 text-xs text-titanium/50">सूत्र · thread, connection, organizing principle</div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-titanium/65">
            A conceptual exploration of wearable molecular data storage — a future engineering vision rather than a
            commercially available product.
          </p>
          <div className="mt-6">
            <ShareRow />
          </div>
        </div>
        {cols.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="eyebrow">{col.heading}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href, id]) => {
                const inPage = href.startsWith("#") && !href.startsWith("#/");
                return (
                  <li key={label}>
                    {inPage ? (
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = id ? document.getElementById(id) : document.querySelector(href);
                          el?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="text-sm text-titanium/70 transition-colors hover:text-soft"
                      >
                        {label}
                      </a>
                    ) : (
                      <a href={href} className="text-sm text-titanium/70 transition-colors hover:text-soft">
                        {label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl space-y-3 border-t border-white/5 pt-6">
        <div className="flex flex-wrap gap-2">
          <Tag>CONCEPT</Tag>
          <Tag>PROPOSED ARCHITECTURE</Tag>
          <Tag tone="warn">FUTURE TARGET</Tag>
          <Tag tone="accent">RESEARCH-BASED</Tag>
        </div>
        <p className="text-xs leading-relaxed text-titanium/45">
          DNA data storage, synthesis, sequencing and digital-to-DNA encoding are active areas of scientific research.
          Visualizations may simplify or abstract complex scientific processes for educational purposes.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mono text-[0.55rem] tracking-[0.28em] text-titanium/40">
          <span>© {new Date().getFullYear()} SUTRA — THE THREAD OF MEMORY</span>
          <span>SMRITI IS WHAT WE REMEMBER · SUTRA IS THE THREAD THAT PRESERVES IT</span>
        </div>
      </div>
    </footer>
  );
}
