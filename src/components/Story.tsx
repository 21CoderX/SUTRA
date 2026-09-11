import { useEffect, useState } from "react";
import { Section, Reveal, Split, Eyebrow, ScrollHint } from "./ui";
import { scroll } from "../store";

/** Re-render-cheap local progress reader for a given scene index */
function useLocal(sceneIndex: number, fps = 20) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (ts - last > 1000 / fps) {
        last = ts;
        const l = scroll.scene === sceneIndex ? scroll.local : scroll.scene > sceneIndex ? 1 : 0;
        setV((p) => (Math.abs(p - l) > 0.005 ? l : p));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sceneIndex, fps]);
  return v;
}

export function Hero() {
  const l = useLocal(0);
  const fade = Math.max(0, 1 - l * 2.2);
  return (
    <Section id="story" scene="hero" height={170} label="Introduction">
      <div className="flex h-full w-full flex-col items-center justify-between py-[12vh] text-center" style={{ opacity: fade }}>
        <div className="eyebrow anim-fadeUp" style={{ animationDelay: "0.4s" }}>
          स्मृति · A CONCEPT FOR WEARABLE MOLECULAR MEMORY
        </div>
        <div>
          <div style={{ letterSpacing: "0.08em" }}>
            <Split
              as="h1"
              text="SUTRA"
              delay={650}
              staggerMs={95}
              y={80}
              className="display text-[clamp(4.5rem,18vw,15rem)] text-soft"
            />
          </div>
          <Split
            as="p"
            text="The Thread of Memory."
            delay={1250}
            staggerMs={16}
            y={26}
            className="display mt-4 text-[clamp(1.4rem,3.4vw,2.6rem)] text-titanium"
          />
          <p className="mx-auto mt-8 max-w-md text-base text-titanium/70 anim-fadeUp" style={{ animationDelay: "2.1s" }}>
            What if your memories could fit inside a ring?
          </p>
          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-3 anim-fadeUp"
            style={{ animationDelay: "2.4s" }}
            data-nodrag
          >
            <a
              href="#/early-access"
              className="btn solid"
              onClick={() => import("../lib/analytics").then((m) => m.event("cta_click", "hero", "early-access"))}
            >
              Request early access
            </a>
            <button
              className="btn"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            >
              Explore the concept
            </button>
          </div>
        </div>
        <div className="anim-fadeUp" style={{ animationDelay: "2.8s" }}>
          <ScrollHint />
        </div>
      </div>
    </Section>
  );
}

export function Question() {
  return (
    <Section scene="question" height={180} align="left" label="The question">
      <div className="max-w-xl">
        <Reveal>
          <Eyebrow>01 — THE QUESTION</Eyebrow>
        </Reveal>
        <Split
          as="h2"
          text="What if your digital life"
          delay={100}
          staggerMs={12}
          className="display mt-6 text-[clamp(2.4rem,6vw,5.2rem)] text-soft"
        />
        <Split
          as="h2"
          text="could become physical?"
          delay={350}
          staggerMs={12}
          className="display text-[clamp(2.4rem,6vw,5.2rem)] text-titanium/70"
        />
        <Reveal delay={260}>
          <p className="mt-8 max-w-md text-titanium/70">
            Photographs, films, documents, voice notes, ideas, projects. Everything that matters to you is already data —
            scattered across phones, drives and clouds you do not control.
          </p>
        </Reveal>
        <Reveal delay={380} staggerChildren className="mt-8 flex flex-wrap gap-2">
          {["PHOTO", "VIDEO", "DOCUMENT", "AUDIO", "NOTES", "PROJECTS"].map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </Reveal>
        <p className="mt-10 mono text-[0.62rem] tracking-[0.3em] text-titanium/40">
          Smriti is what we remember. Sutra is the thread that preserves it.
        </p>
      </div>
    </Section>
  );
}

const BITS = "01001101 01100101 01101101 01101111 01110010 01111001 00100000 01100010 01100101 01100011 01101111 01101101 01100101 01110011";

export function DigitalData() {
  const l = useLocal(2);
  const stage = l < 0.3 ? 0 : l < 0.6 ? 1 : 2;
  return (
    <Section scene="data" height={200} align="right" label="Memory becomes data">
      <div className="max-w-lg text-right">
        <Reveal>
          <Eyebrow>02 — DIGITAL DATA</Eyebrow>
        </Reveal>
        <Split
          as="h2"
          text="First, memory"
          delay={100}
          staggerMs={14}
          className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft"
        />
        <Split
          as="h2"
          text="becomes data."
          delay={300}
          staggerMs={14}
          className="display text-[clamp(2.2rem,5vw,4.4rem)] text-soft"
        />
        <Reveal delay={240}>
          <div className="mt-8 glass rounded-md p-5 text-left" data-nodrag>
            <div className="flex items-center justify-between">
              <span className="mono text-[0.62rem] tracking-[0.28em] text-titanium/60">vacation.jpg</span>
              <span className={`mono text-[0.6rem] tracking-[0.24em] ${stage === 2 ? "text-accent" : "text-titanium/50"}`}>
                {stage === 0 ? "PIXELS" : stage === 1 ? "ENCRYPTING" : "ENCODED STREAM"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-16 gap-[3px]" aria-hidden="true">
              {Array.from({ length: 64 }).map((_, i) => {
                const hue = 200 + ((i * 37) % 40);
                const bg = stage === 0 ? `hsl(${hue} 25% ${35 + ((i * 13) % 30)}%)` : stage === 1 ? (i % 3 ? "#1c2025" : "#3a4048") : i % 2 ? "#7fd3e6" : "#1c2025";
                return <span key={i} className="aspect-square rounded-[1px] transition-colors duration-700" style={{ background: bg, transitionDelay: `${(i % 16) * 20}ms` }} />;
              })}
            </div>
            <div className="mt-4 mono text-[0.6rem] leading-relaxed tracking-[0.12em] text-titanium/50 break-all">
              {stage === 0 ? "RGB(43,61,82) RGB(52,71,94) RGB(60,80,101) …" : BITS}
            </div>
          </div>
        </Reveal>
        <Reveal delay={320}>
          <p className="mt-6 text-sm text-titanium/70">
            A photograph is never placed “into” DNA. It is converted into digital information, encrypted, encoded — and only
            then represented as DNA-compatible sequences.
          </p>
        </Reveal>
        <Split
          as="p"
          text="Then data becomes molecular information."
          delay={500}
          staggerMs={10}
          y={24}
          className="display mt-8 text-[clamp(1.2rem,2.4vw,1.8rem)] text-titanium"
        />
      </div>
    </Section>
  );
}

const SEQ = "ACGTAGCTGACCTAGCTAGGATCCAGTTACGGCTAAGCTTGCAGTACCGATCGATGCCTAGGTACGATCGTTAGCAGCTAGCTTAGCGATCGGCTAACGTAGCTGACCTAGC";

export function DNAEncoding() {
  const l = useLocal(3);
  const shown = Math.floor(l * 1.6 * SEQ.length);
  const frag = l > 0.45 ? 3 : l > 0.35 ? 2 : l > 0.25 ? 1 : 0;
  return (
    <Section scene="dna" height={220} align="left" label="DNA encoding">
      <div className="max-w-xl">
        <Reveal>
          <Eyebrow>03 — DNA ENCODING</Eyebrow>
        </Reveal>
        <Split
          as="h2"
          text="Four letters."
          delay={100}
          staggerMs={14}
          className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft"
        />
        <Split
          as="h2"
          text="One archive."
          delay={300}
          staggerMs={14}
          className="display text-[clamp(2.2rem,5vw,4.4rem)] text-titanium/70"
        />
        <Reveal delay={200} staggerChildren className="mt-8 flex gap-6 mono text-2xl md:text-3xl tracking-[0.3em]">
          <span className="text-accent">A</span>
          <span className="text-soft">C</span>
          <span className="text-violet">G</span>
          <span className="text-titanium">T</span>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-6 h-16 overflow-hidden mono text-[0.72rem] leading-6 tracking-[0.22em] text-titanium/60 break-all" aria-label="Example encoded sequence">
            {SEQ.slice(0, Math.min(SEQ.length, shown))}
            <span className="text-accent" style={{ animation: "blink 1s infinite" }}>▍</span>
          </div>
        </Reveal>
        <Reveal delay={320}>
          <div className="mt-6 space-y-2" data-nodrag>
            {["FRAGMENT 001", "FRAGMENT 002", "FRAGMENT 003"].map((f, i) => (
              <div key={f} className={`flex items-center gap-4 transition-all duration-700 ${frag > i ? "opacity-100 translate-x-0" : "opacity-20 -translate-x-2"}`}>
                <span className="mono text-[0.62rem] tracking-[0.28em] text-soft w-32">{f}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
                <span className="mono text-[0.58rem] tracking-[0.2em] text-titanium/50">ADDR · ECC · ×3</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={380}>
          <p className="mt-8 max-w-md text-sm text-titanium/70">
            Real encoding is more than swapping bits for bases. Data is fragmented, each fragment receives an address,
            redundancy and error-correction data are added, and the fragments are merged into the archive.
          </p>
        </Reveal>
        <Reveal delay={420} staggerChildren className="mt-4 flex flex-wrap gap-2">
          <span className="tag accent">ENCODING</span>
          <span className="tag">FRAGMENTATION</span>
          <span className="tag">ADDRESSING</span>
          <span className="tag">ERROR CORRECTION</span>
        </Reveal>
      </div>
    </Section>
  );
}

export { useLocal };
