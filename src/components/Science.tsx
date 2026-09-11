import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Section, Reveal, Eyebrow, Tag } from "./ui";
import { useLocal } from "./Story";
import { useUI } from "../store";

const REAL = [
  "DNA data encoding",
  "DNA synthesis",
  "DNA sequencing",
  "Digital information stored in DNA",
  "Error correction for molecular data",
  "Cryptographic hardware (secure elements)",
  "Bluetooth communication in rings",
  "Wearable contact & optical sensors",
  "High-density molecular storage research",
];
const FUTURE = [
  "Ring-sized integrated DNA writer",
  "Ring-sized integrated DNA reader",
  "Instant molecular random access",
  "Consumer-scale molecular storage",
  "Ring-scale high-speed wireless for large transfers",
  "Fully integrated wearable DNA storage system",
];

export function Reality() {
  return (
    <Section scene="reality" height={200} align="left" label="What exists today">
      <div className="w-full max-w-5xl">
        <Reveal>
          <Eyebrow>12 — HOW REAL IS THIS?</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-6 text-[clamp(2.4rem,6vw,5.2rem)] text-soft">What exists today?</h2>
        </Reveal>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <Reveal delay={200}>
            <div className="border-t border-accent/50 pt-4">
              <div className="flex items-center justify-between">
                <div className="mono text-[0.72rem] tracking-[0.35em] text-soft">REAL TODAY</div>
                <Tag tone="accent">RESEARCH-BASED</Tag>
              </div>
              <ul className="mt-5 space-y-2.5">
                {REAL.map((r, i) => (
                  <li key={r} className="flex items-start gap-3 text-sm text-titanium/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>
                      <span className="mono text-[0.6rem] text-titanium/40 mr-2">{String(i + 1).padStart(2, "0")}</span>
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="border-t border-violet/50 pt-4">
              <div className="flex items-center justify-between">
                <div className="mono text-[0.72rem] tracking-[0.35em] text-soft">FUTURE ENGINEERING</div>
                <Tag tone="warn">FUTURE DESIGN</Tag>
              </div>
              <ul className="mt-5 space-y-2.5">
                {FUTURE.map((r, i) => (
                  <li key={r} className="flex items-start gap-3 text-sm text-titanium/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet" />
                    <span>
                      <span className="mono text-[0.6rem] text-titanium/40 mr-2">{String(i + 1).padStart(2, "0")}</span>
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-titanium/50">
                SUTRA does not exist commercially. The integrated ring shown here is a proposed architecture, not a product.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

const BASES = [
  ["A", "Adenine", "text-accent"],
  ["C", "Cytosine", "text-soft"],
  ["G", "Guanine", "text-violet"],
  ["T", "Thymine", "text-titanium"],
];
const LIMITS = [
  ["SYNTHESIS", "Writing DNA is slow and expensive compared with flash."],
  ["SEQUENCING", "Reading is far slower than electronic memory."],
  ["RANDOM ACCESS", "Finding one file among billions of molecules is complex."],
  ["ERROR CORRECTION", "Required, always — molecules are imperfect."],
  ["MINIATURIZATION", "Lab instruments are not ring-sized. Yet."],
];

export function WhyDNA() {
  return (
    <Section scene="why" height={200} align="right" label="Why DNA">
      <div className="w-full max-w-2xl text-right">
        <Reveal>
          <Eyebrow>13 — THE SCIENCE</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-6 text-[clamp(2.4rem,6vw,5.2rem)] text-soft">Why DNA?</h2>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-8 grid grid-cols-4 gap-3 text-left" data-nodrag>
            {BASES.map(([b, n, c]) => (
              <div key={b} className="glass rounded-md p-4">
                <div className={`display text-4xl ${c}`}>{b}</div>
                <div className="mt-2 mono text-[0.58rem] tracking-[0.25em] text-titanium/60 uppercase">{n}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={280}>
          <p className="ml-auto mt-6 max-w-lg text-sm text-titanium/75">
            DNA represents information using four nucleotides. Digital data can be encoded into sequences of these bases.
            The molecule has an extraordinarily high theoretical information density and can remain stable for a very long
            time when kept cool, dry and protected — which is exactly what makes it interesting for archival storage.
          </p>
        </Reveal>
        <Reveal delay={340}>
          <div className="mt-8 border-t border-titanium/15 pt-4 text-left">
            <div className="eyebrow">However</div>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {LIMITS.map(([t, s]) => (
                <li key={t}>
                  <div className="mono text-[0.62rem] tracking-[0.28em] text-soft">{t}</div>
                  <div className="mt-1 text-xs text-titanium/60">{s}</div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

const InteractiveDNA = lazy(() => import("../three/InteractiveDNA"));

export interface Fragment {
  id: number;
  seq: string;
  status: "VERIFIED" | "ERROR" | "REDUNDANT";
  redundancy: number;
}

export function DNAVisualizer() {
  const webgl = useUI((s) => s.webgl);
  const [selected, setSelected] = useState<Fragment | null>(null);
  // Mount the second WebGL canvas only while its section is near the viewport,
  // so an off-screen canvas never spends GPU time rendering.
  const canvasHost = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = canvasHost.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [showErrors, setShowErrors] = useState(true);
  const [showRedundancy, setShowRedundancy] = useState(false);
  const fragments = useMemo<Fragment[]>(() => {
    const letters = "ACGT";
    let s = 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 72 }, (_, i) => ({
      id: 800 + i,
      seq: Array.from({ length: 24 }, () => letters[Math.floor(rnd() * 4)]).join(""),
      status: i % 17 === 5 ? "ERROR" : i % 6 === 0 ? "REDUNDANT" : "VERIFIED",
      redundancy: 3,
    }));
  }, []);

  return (
    <Section scene="visualizer" height={200} align="left" label="Interactive DNA visualizer">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px] lg:items-center">
        <div className="order-2 lg:order-1">
          <Reveal>
            <Eyebrow>14 — INTERACTIVE VISUALIZER</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display mt-4 text-[clamp(1.8rem,4vw,3.4rem)] text-soft">Inspect a strand.</h2>
          </Reveal>
          <div
            ref={canvasHost}
            className="relative mt-4 h-[42vh] min-h-[280px] w-full overflow-hidden rounded-lg border border-white/5 bg-graphite/40"
            data-nodrag
            role="img"
            aria-label="Interactive 3D visualization of seventy-two addressed DNA fragments arranged as a rotating double helix. Fragments can be highlighted for errors or redundancy; selecting one shows its abstract sequence and metadata."
          >
            {webgl && inView ? (
              <Suspense fallback={<div className="flex h-full items-center justify-center mono text-[0.6rem] tracking-[0.3em] text-titanium/50">LOADING STRAND</div>}>
                <InteractiveDNA fragments={fragments} selected={selected?.id ?? null} onSelect={setSelected} showErrors={showErrors} showRedundancy={showRedundancy} />
              </Suspense>
            ) : webgl ? (
              <div className="flex h-full items-center justify-center mono text-[0.6rem] tracking-[0.3em] text-titanium/50" aria-hidden="true">
                STRAND PAUSED
              </div>
            ) : (
              <div className="grid h-full grid-cols-12 gap-1 p-4">
                {fragments.map((f) => (
                  <button key={f.id} onClick={() => setSelected(f)} className={`rounded-sm ${f.status === "ERROR" && showErrors ? "bg-red-400/70" : f.status === "REDUNDANT" && showRedundancy ? "bg-violet/70" : "bg-accent/40"} ${selected?.id === f.id ? "ring-1 ring-soft" : ""}`} aria-label={`Fragment ${f.id}, status ${f.status}`} />
                ))}
              </div>
            )}
            <div className="pointer-events-none absolute left-3 top-3 mono text-[0.58rem] tracking-[0.3em] text-titanium/50">DRAG · SCROLL TO ZOOM · CLICK A RUNG</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" data-nodrag>
            <button className={`tag ${showErrors ? "accent" : ""}`} onClick={() => setShowErrors((v) => !v)} aria-pressed={showErrors}>
              HIGHLIGHT ERRORS
            </button>
            <button className={`tag ${showRedundancy ? "warn" : ""}`} onClick={() => setShowRedundancy((v) => !v)} aria-pressed={showRedundancy}>
              SHOW REDUNDANCY
            </button>
            <span className="tag">ABSTRACT VISUALIZATION</span>
          </div>
        </div>
        <div className="order-1 lg:order-2" data-nodrag aria-live="polite">
          <div className="glass rounded-md p-5 mono text-[0.68rem] leading-6 tracking-[0.2em]">
            {selected ? (
              <div key={selected.id} className="anim-fadeUp">
                <div className="text-soft">FRAGMENT {String(selected.id).padStart(4, "0")}</div>
                <div className="mt-3 break-all text-titanium/70 tracking-[0.12em]">{selected.seq}…</div>
                <div className="mt-1 text-accent">{"█".repeat(10)}</div>
                <div className="mt-4 text-titanium/50">STATUS</div>
                <div className={selected.status === "ERROR" ? "text-red-300" : "text-soft"}>{selected.status === "ERROR" ? "ERROR · RECONSTRUCTABLE" : "VERIFIED"}</div>
                <div className="mt-3 text-titanium/50">REDUNDANCY</div>
                <div className="text-soft">{selected.redundancy}×</div>
                <div className="mt-3 text-titanium/50">INTEGRITY</div>
                <div className={selected.status === "ERROR" ? "text-violet" : "text-soft"}>{selected.status === "ERROR" ? "RECOVERED VIA PARITY" : "VALID"}</div>
                <div className="mt-3 text-titanium/50">ADDRESS</div>
                <div className="text-soft">0x{(selected.id * 7919).toString(16).toUpperCase().padStart(6, "0")}</div>
              </div>
            ) : (
              <div className="text-titanium/50">
                SELECT A FRAGMENT
                <div className="mt-3 text-[0.6rem] tracking-[0.15em] normal-case text-titanium/40 font-sans">
                  Each rung represents one addressed fragment. Data shown is illustrative and does not expose biological storage.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

const ZOOM_LAYERS = [
  { label: "HUMAN HAND", note: "1 m", glyph: "✋" },
  { label: "RING", note: "20 mm", glyph: "◯" },
  { label: "RING SURFACE", note: "1 mm", glyph: "▤" },
  { label: "INTERNAL CHAMBER", note: "100 µm", glyph: "◎" },
  { label: "MOLECULAR ARCHIVE", note: "1 µm", glyph: "⁘" },
  { label: "DNA STRAND", note: "2 nm", glyph: "⌇" },
  { label: "NUCLEOTIDE SEQUENCE", note: "ACGT", glyph: "ACGT" },
  { label: "DIGITAL INFORMATION", note: "0110", glyph: "0110" },
  { label: "PHOTO", note: "vacation.jpg", glyph: "▣" },
];

export function Zoom() {
  const l = useLocal(15, 30);
  const reduced = useUI((s) => s.reduced);
  const pos = l * (ZOOM_LAYERS.length - 1);
  return (
    <Section scene="zoom" height={320} label="Continuous zoom from hand to photo">
      <div className="relative flex h-full w-full items-center justify-center">
        {ZOOM_LAYERS.map((z, i) => {
          const d = pos - i;
          const opacity = Math.max(0, 1 - Math.abs(d) * 1.2);
          const scale = reduced ? 1 : Math.pow(2.2, d);
          if (opacity <= 0) return null;
          return (
            <div key={z.label} className="absolute flex flex-col items-center text-center" style={{ opacity, transform: `scale(${Math.min(scale, 6)})`, transition: reduced ? "opacity 0.3s" : "none" }}>
              <div className={`display ${z.glyph.length > 2 ? "text-[clamp(2rem,7vw,5rem)] tracking-[0.3em]" : "text-[clamp(3rem,10vw,8rem)]"} text-soft/90`}>{z.glyph}</div>
              <div className="mt-3 mono text-[0.62rem] tracking-[0.35em] text-titanium/80">{z.label}</div>
              <div className="mono text-[0.58rem] tracking-[0.25em] text-accent/70">{z.note}</div>
            </div>
          );
        })}
        <div className="absolute bottom-16 left-0 right-0 mx-auto w-full max-w-xs px-6" aria-hidden="true">
          <div className="flex justify-between mono text-[0.55rem] tracking-[0.3em] text-titanium/40">
            <span>MACRO</span>
            <span>MICRO</span>
            <span>DATA</span>
          </div>
          <div className="mt-2 h-px bg-titanium/20">
            <div className="h-px bg-accent" style={{ width: `${l * 100}%` }} />
          </div>
        </div>
        <div className="absolute top-[12vh] eyebrow">15 — FROM HAND TO PHOTO</div>
      </div>
    </Section>
  );
}
