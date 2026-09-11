import { useEffect, useState } from "react";
import { Section, Reveal, Split, Eyebrow, Tag, Pipeline } from "./ui";
import { RING_COMPONENTS, setUI, useUI } from "../store";
import { useLocal } from "./Story";

export function ExplodedView() {
  const selected = useUI((s) => s.selected);
  const comp = RING_COMPONENTS.find((c) => c.id === selected) ?? null;
  const l = useLocal(4);
  // clear selection when leaving the section
  useEffect(() => {
    if (l >= 1 || l <= 0) setUI({ selected: null });
  }, [l]);

  return (
    <Section id="how" scene="explode" height={260} align="left" label="Inside the ring" className="select-none">
      <div className="w-full">
        <div className="max-w-xs md:max-w-sm">
          <Reveal>
            <Eyebrow>04 — ENTER THE RING</Eyebrow>
          </Reveal>
          <Split
            as="h2"
            text="An engineered thread."
            delay={80}
            staggerMs={12}
            className="display mt-5 text-[clamp(2rem,4.4vw,3.8rem)] text-soft"
          />
          <Reveal delay={180}>
            <p className="mt-4 text-sm text-titanium/70">
              Eight conceptual layers. Drag to rotate. Select a system to inspect it.
            </p>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 md:mt-10 md:grid-cols-[minmax(0,320px)_1fr]">
          <div data-nodrag>
            <Reveal as="ul" staggerChildren className="flex flex-wrap gap-2 md:flex-col md:gap-1" aria-label="Ring components">
              {RING_COMPONENTS.map((c, i) => {
                const active = selected === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setUI({ selected: active ? null : c.id })}
                      aria-pressed={active}
                      className={`group flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors ${active ? "bg-soft/10" : "hover:bg-soft/5"}`}
                    >
                      <span className={`mono text-[0.6rem] ${active ? "text-accent" : "text-titanium/40"}`}>0{i + 1}</span>
                      <span className={`mono text-[0.68rem] tracking-[0.22em] uppercase ${active ? "text-soft" : "text-titanium/80"}`}>{c.label}</span>
                      <span className={`ml-auto hidden h-px w-6 transition-all md:block ${active ? "bg-accent w-10" : "bg-titanium/20"}`} />
                    </button>
                  </li>
                );
              })}
            </Reveal>
          </div>

          <div className="md:justify-self-end md:max-w-sm w-full" data-nodrag aria-live="polite">
            {comp ? (
              <div key={comp.id} className="glass rounded-md p-5 anim-fadeUp">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mono text-[0.72rem] tracking-[0.3em] text-soft uppercase">{comp.label}</div>
                    <div className="mt-1 text-xs text-titanium/60">{comp.short}</div>
                  </div>
                  <Tag tone={comp.status === "FUTURE DESIGN" ? "warn" : comp.status === "RESEARCH-BASED" ? "accent" : "default"}>{comp.status}</Tag>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <div className="eyebrow mb-1">What it does</div>
                    <p className="text-titanium/80">{comp.what}</p>
                  </div>
                  <div>
                    <div className="eyebrow mb-1">Why it matters</div>
                    <p className="text-titanium/80">{comp.why}</p>
                  </div>
                  <div>
                    <div className="eyebrow mb-1">Status</div>
                    <p className="text-titanium/60 text-xs">{comp.statusNote}</p>
                  </div>
                </div>
                <button onClick={() => setUI({ selected: null })} className="mt-5 mono text-[0.6rem] tracking-[0.3em] text-titanium/60 hover:text-soft">
                  ← BACK TO OVERVIEW
                </button>
              </div>
            ) : (
              <div className="hidden md:grid grid-cols-2 gap-x-8 gap-y-5 text-left">
                {[
                  ["MOLECULAR ARCHIVE", "Synthetic DNA storage medium"],
                  ["SECURE CORE", "Hardware-backed cryptographic identity"],
                  ["CACHE", "High-speed temporary working memory"],
                  ["WIRELESS LINK", "Connects SUTRA to compatible devices"],
                ].map(([t, s]) => (
                  <div key={t}>
                    <div className="mono text-[0.66rem] tracking-[0.28em] text-soft">{t}</div>
                    <div className="mt-1 text-xs text-titanium/60">{s}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

const ARCHIVE_STEPS = ["FILE", "ENCRYPTED", "FRAGMENTED", "ERROR-CORRECTED", "DNA ENCODED", "ARCHIVED"];

export function MolecularArchive() {
  const l = useLocal(5);
  const active = Math.min(ARCHIVE_STEPS.length - 1, Math.floor(l * 1.4 * ARCHIVE_STEPS.length));
  return (
    <Section scene="archive" height={220} align="right" label="Molecular archive">
      <div className="max-w-lg text-right">
        <Reveal>
          <Eyebrow>05 — THE MOLECULAR ARCHIVE</Eyebrow>
        </Reveal>
        <Split
          as="h2"
          text="One file."
          delay={100}
          staggerMs={16}
          className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft"
        />
        <Split
          as="h2"
          text="Thousands of fragments."
          delay={280}
          staggerMs={10}
          className="display text-[clamp(2.2rem,5vw,4.4rem)] text-titanium/70"
        />
        <Reveal delay={200}>
          <div className="mt-8 glass rounded-md p-5 text-left" data-nodrag>
            <div className="flex items-center justify-between">
              <span className="mono text-[0.68rem] tracking-[0.28em] text-soft">vacation.jpg</span>
              <span className="mono text-[0.58rem] tracking-[0.2em] text-titanium/50">4.2 MB · 1,312 FRAGMENTS · CONCEPTUAL</span>
            </div>
            <div className="mt-4">
              <Pipeline steps={ARCHIVE_STEPS} active={active} />
            </div>
            <div className="mt-4 grid grid-cols-24 gap-[2px]" aria-hidden="true">
              {Array.from({ length: 96 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2 rounded-[1px] transition-colors duration-500"
                  style={{ background: i / 96 < (active + 1) / ARCHIVE_STEPS.length ? (i % 7 === 0 ? "#9b8cf0" : "#7fd3e6") : "#1c2025", transitionDelay: `${i * 6}ms` }}
                />
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 text-sm text-titanium/70">
            Inside the chamber, a single digital file is not one molecule. It is represented across many short, addressed
            fragments — each one carrying a piece of the picture and the information needed to put it back together.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

export function ErrorCorrection() {
  const l = useLocal(6);
  const phase = l < 0.25 ? 0 : l < 0.45 ? 1 : l < 0.7 ? 2 : 3; // ok, damaged, detected, repaired
  const damaged = 37;
  return (
    <Section scene="error" height={220} align="left" label="Error correction">
      <div className="max-w-xl">
        <Reveal>
          <Eyebrow>06 — ERROR CORRECTION</Eyebrow>
        </Reveal>
        <Split
          as="h2"
          text="Molecules"
          delay={100}
          staggerMs={18}
          className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft"
        />
        <Split
          as="h2"
          text="are not perfect."
          delay={280}
          staggerMs={12}
          className="display text-[clamp(2.2rem,5vw,4.4rem)] text-titanium/70"
        />
        <Reveal delay={200}>
          <div className="mt-8 glass rounded-md p-5" data-nodrag>
            <div className="flex items-center justify-between">
              <span className="mono text-[0.62rem] tracking-[0.28em] text-titanium/70">100 FRAGMENTS</span>
              <span
                className={`mono text-[0.62rem] tracking-[0.28em] transition-colors ${
                  phase === 1 ? "text-red-400" : phase === 2 ? "text-violet" : phase === 3 ? "text-accent" : "text-titanium/50"
                }`}
                aria-live="polite"
              >
                {phase === 0 ? "INTEGRITY · VALID" : phase === 1 ? "FRAGMENT 037 · DEGRADED" : phase === 2 ? "FRAGMENT ERROR · DETECTED" : "RECONSTRUCTED · VERIFIED"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-20 gap-[3px]" aria-hidden="true">
              {Array.from({ length: 100 }).map((_, i) => {
                const isBad = i === damaged;
                let bg = "#3b4550";
                if (isBad && phase === 1) bg = "#ff5c5c";
                if (isBad && phase === 2) bg = "#9b8cf0";
                if (isBad && phase === 3) bg = "#7fd3e6";
                const neighbor = phase === 2 && Math.abs(i - damaged) <= 2 && !isBad;
                if (neighbor) bg = "#6f7f8c";
                return <span key={i} className="aspect-square rounded-[1px] transition-all duration-500" style={{ background: bg, boxShadow: isBad && phase > 0 ? `0 0 12px ${bg}` : "none" }} />;
              })}
            </div>
            <Reveal delay={0} staggerChildren className="mt-4 flex gap-2">
              <span className="tag">REDUNDANCY</span>
              <span className="tag">PARITY DATA</span>
              <span className={`tag ${phase === 3 ? "accent" : ""}`}>RECONSTRUCTION</span>
            </Reveal>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 max-w-md text-sm text-titanium/70">
            DNA can degrade, reads can be wrong, fragments can go missing. Redundancy and error-correcting codes let the
            system detect the damage and rebuild what was lost from the fragments that survived.
          </p>
        </Reveal>
        <Reveal delay={360}>
          <blockquote className="mt-6 border-l border-accent/40 pl-4 text-titanium">
            Molecular storage is not simply about writing information.
            <br />
            It is about preserving information despite errors.
          </blockquote>
        </Reveal>
      </div>
    </Section>
  );
}

const SCALE = [
  ["PHOTOS", "≈ 25 million"],
  ["VIDEO", "≈ 4,000 hours in 4K"],
  ["DOCUMENTS", "≈ a lifetime of writing"],
  ["MUSIC", "≈ 20 million tracks"],
  ["PROJECTS", "every draft, every version"],
  ["BACKUPS", "decades of devices"],
];

export function Vision() {
  const [count, setCount] = useState(0);
  const l = useLocal(7);
  useEffect(() => {
    const target = Math.round(Math.min(1, l * 2.2) * 100);
    if (target === count) return;
    const id = setTimeout(() => setCount((c) => c + Math.sign(target - c)), 12);
    return () => clearTimeout(id);
  }, [l, count]);
  return (
    <Section scene="vision" height={220} label="The 100 TB vision">
      <div className="w-full max-w-4xl text-center">
        <Reveal>
          <Eyebrow>07 — THE VISION</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <div className="display mt-4 text-[clamp(5rem,20vw,16rem)] text-soft tabular-nums" aria-label="100 terabytes">
            {count}
            <span className="text-titanium/60 text-[0.45em]"> TB</span>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div className="flex items-center justify-center gap-3">
            <Tag tone="warn">FUTURE DESIGN TARGET</Tag>
            <span className="text-sm text-titanium/70">A conceptual personal archive target.</span>
          </div>
        </Reveal>
        <Reveal delay={300} staggerChildren className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 text-left md:grid-cols-3">
          {SCALE.map(([t, s]) => (
            <div key={t} className="border-t border-titanium/15 pt-3">
              <div className="mono text-[0.62rem] tracking-[0.28em] text-soft">{t}</div>
              <div className="mt-1 text-xs text-titanium/60">{s}</div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={380}>
          <p className="mx-auto mt-8 max-w-md text-xs text-titanium/50">
            Illustrative equivalents only. No current SUTRA ring stores 100 TB. DNA's theoretical density makes such a
            target scientifically interesting — building it into a ring remains future engineering.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
