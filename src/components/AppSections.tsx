import { useEffect, useRef, useState } from "react";
import { Section, Reveal, Eyebrow, Tag, Pipeline } from "./ui";
import { useUI } from "../store";

const UPLOAD = ["ENCRYPTING", "COMPRESSING", "FRAGMENTING", "ERROR-CORRECTION DATA", "DNA ENCODING", "MOLECULAR ARCHIVE", "VERIFIED"];
const RETRIEVE = ["MOLECULAR ARCHIVE", "READ / SEQUENCE", "RECONSTRUCT", "VERIFY", "DECRYPT", "CACHE", "DEVICE"];

const SAMPLES = [
  { name: "memory.jpg", kind: "PHOTO", size: "3.8 MB", glyph: "▣" },
  { name: "first-steps.mp4", kind: "VIDEO", size: "412 MB", glyph: "▶" },
  { name: "thesis-final.pdf", kind: "DOCUMENT", size: "9.1 MB", glyph: "≡" },
];

const FOLDERS = ["Photos", "Videos", "Documents", "Projects", "Archives", "Other"];

type Mode = "idle" | "upload" | "retrieve";

export function Dashboard() {
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(-1);
  const [file, setFile] = useState(SAMPLES[0]);
  const [archived, setArchived] = useState<string[]>([]);
  const [done, setDone] = useState<Mode>("idle");
  const timers = useRef<number[]>([]);
  const reduced = useUI((s) => s.reduced);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = (m: Mode, f = file) => {
    clear();
    setFile(f);
    setMode(m);
    setDone("idle");
    setStep(0);
    const steps = m === "upload" ? UPLOAD : RETRIEVE;
    const d = reduced ? 220 : 520;
    steps.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(window.setTimeout(() => setStep(i), d * i));
    });
    timers.current.push(
      window.setTimeout(() => {
        setStep(steps.length);
        setDone(m);
        if (m === "upload") setArchived((a) => (a.includes(f.name) ? a : [...a, f.name]));
      }, d * steps.length + 200),
    );
  };

  const steps = mode === "upload" ? UPLOAD : RETRIEVE;
  const busy = mode !== "idle" && done === "idle";

  return (
    <Section id="technology" scene="app" height={240} align="left" label="SUTRA application">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <Reveal>
            <Eyebrow>10 — THE SUTRA APP</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft">
              A human interface
              <br />
              <span className="text-titanium/70">to molecular memory.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-md text-sm text-titanium/70">
              Select a sample file to archive it, then retrieve it. This is an educational simulation of the pipeline —
              your browser does not synthesize DNA.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-6 space-y-2" data-nodrag>
              {SAMPLES.map((s) => (
                <button
                  key={s.name}
                  disabled={busy}
                  onClick={() => start("upload", s)}
                  className={`flex w-full items-center gap-4 rounded-sm border px-4 py-3 text-left transition-colors ${file.name === s.name ? "border-soft/40 bg-soft/5" : "border-titanium/15 hover:border-titanium/40"} disabled:opacity-50`}
                >
                  <span className="text-accent text-lg">{s.glyph}</span>
                  <span className="flex-1">
                    <span className="block mono text-[0.7rem] tracking-[0.2em] text-soft">{s.name}</span>
                    <span className="block text-[0.65rem] text-titanium/50">{s.kind} · {s.size}</span>
                  </span>
                  <span className="mono text-[0.58rem] tracking-[0.25em] text-titanium/60">{archived.includes(s.name) ? "ARCHIVED" : "UPLOAD →"}</span>
                </button>
              ))}
              <div className="flex gap-3 pt-2">
                <button className="btn" disabled={busy || !archived.includes(file.name)} onClick={() => start("retrieve")}>
                  Retrieve {file.name}
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="glass overflow-hidden rounded-lg" data-nodrag aria-live="polite">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="mono text-[0.72rem] tracking-[0.4em] text-soft">SUTRA</span>
                <span className="flex items-center gap-1.5 mono text-[0.58rem] tracking-[0.25em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "blink 2s infinite" }} />
                  CONNECTED
                </span>
              </div>
              <span className="mono text-[0.58rem] tracking-[0.25em] text-titanium/50">WEAR STATUS · AUTHENTICATED</span>
            </div>

            <div className="grid gap-px bg-white/5 md:grid-cols-4">
              {[
                ["MOLECULAR ARCHIVE", "100 TB", "FUTURE TARGET", "warn"],
                ["CACHE", "64 GB", "ACTIVE · CONCEPTUAL", "accent"],
                ["SECURITY", "PROTECTED", "SECURE ELEMENT", "default"],
                ["DEVICE", "CONNECTED", "BLE · NFC", "default"],
              ].map(([t, v, s, tone]) => (
                <div key={t} className="bg-obsidian/60 px-5 py-4">
                  <div className="eyebrow">{t}</div>
                  <div className="mt-2 display text-2xl text-soft">{v}</div>
                  <div className="mt-2">
                    <Tag tone={tone as "warn" | "accent" | "default"}>{s}</Tag>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-px bg-white/5 md:grid-cols-6">
              {FOLDERS.map((f) => (
                <div key={f} className="bg-obsidian/60 px-4 py-3">
                  <div className="text-titanium/40">▭</div>
                  <div className="mt-1 text-xs text-soft">{f}</div>
                </div>
              ))}
            </div>

            <div className="px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="mono text-[0.62rem] tracking-[0.28em] text-titanium/60">
                  {mode === "idle" ? "PIPELINE · IDLE" : mode === "upload" ? `ARCHIVING · ${file.name}` : `RETRIEVING · ${file.name}`}
                </span>
                {mode !== "idle" && (
                  <span className="mono text-[0.6rem] tracking-[0.25em] text-titanium/50 tabular-nums">
                    {Math.min(100, Math.round((Math.min(step, steps.length) / steps.length) * 100))}%
                  </span>
                )}
              </div>
              <div className="mt-3 h-px w-full bg-white/10">
                <div className="h-px bg-accent transition-all duration-500" style={{ width: mode === "idle" ? "0%" : `${(Math.min(step, steps.length) / steps.length) * 100}%` }} />
              </div>
              <div className="mt-4">
                <Pipeline steps={mode === "idle" ? UPLOAD : steps} active={mode === "idle" ? -1 : step} />
              </div>

              <div className="mt-5 flex min-h-[4.5rem] items-center gap-4">
                {done === "upload" && (
                  <div className="anim-fadeUp">
                    <div className="display text-3xl text-soft">ARCHIVED</div>
                    <div className="mt-1 text-xs text-titanium/60">{file.name} is now represented as encrypted, error-corrected molecular fragments.</div>
                  </div>
                )}
                {done === "retrieve" && (
                  <div className="anim-fadeUp flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-accent/40 bg-gunmetal text-2xl text-accent">{file.glyph}</div>
                    <div>
                      <div className="mono text-[0.7rem] tracking-[0.2em] text-soft">{file.name}</div>
                      <div className="mt-1 text-xs text-titanium/60">Your memory returns as ordinary data.</div>
                    </div>
                  </div>
                )}
                {busy && (
                  <div className="mono text-[0.62rem] tracking-[0.3em] text-accent" style={{ animation: "blink 1.2s infinite" }}>
                    {steps[Math.min(step, steps.length - 1)]}
                  </div>
                )}
                {mode === "idle" && <div className="text-xs text-titanium/40">Choose a sample file to begin the simulation.</div>}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export function CacheSection() {
  const [dir, setDir] = useState<"out" | "in">("out");
  useEffect(() => {
    const id = setInterval(() => setDir((d) => (d === "out" ? "in" : "out")), 4200);
    return () => clearInterval(id);
  }, []);
  const reduced = useUI((s) => s.reduced);
  const nodes = [
    ["DNA", "Huge archival capacity", "Slow, deliberate access"],
    ["CACHE", "Fast everyday access", "Solid-state working memory"],
    ["APP", "Human-friendly interface", "Phone, tablet, computer"],
  ];
  return (
    <Section scene="cache" height={200} align="right" label="Cache architecture">
      <div className="w-full max-w-3xl text-right">
        <Reveal>
          <Eyebrow>11 — ARCHIVE VS. CACHE</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft">
            DNA is the archive.
            <br />
            <span className="text-titanium/70">The cache is the present.</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="ml-auto mt-6 max-w-md text-sm text-titanium/70">
            Molecular storage is intended for long-term preservation, not for scrolling through photos. Recently used
            files live in a conventional fast cache; the DNA layer holds everything, for a very long time.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="relative mt-10 grid grid-cols-3 gap-3 text-left" data-nodrag>
            {nodes.map(([t, s, s2], i) => (
              <div key={t} className={`glass rounded-md p-4 transition-colors duration-700 ${(dir === "out" && i === 0) || (dir === "in" && i === 2) ? "border-accent/40" : ""}`}>
                <div className="mono text-[0.72rem] tracking-[0.3em] text-soft">{t}</div>
                <div className="mt-2 text-xs text-titanium/80">{s}</div>
                <div className="mt-1 text-[0.65rem] text-titanium/50">{s2}</div>
              </div>
            ))}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden="true">
              <div className="relative mx-[16%] h-px bg-titanium/20">
                <span
                  key={dir}
                  className="absolute -top-1 h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_#7fd3e6]"
                  style={{
                    animation: reduced ? "none" : `${dir === "out" ? "flowRight" : "flowLeft"} 3.6s cubic-bezier(0.4,0,0.2,1) forwards`,
                    left: dir === "out" ? "0%" : "100%",
                  }}
                />
              </div>
            </div>
            <style>{`@keyframes flowRight{from{left:0%}to{left:100%}}@keyframes flowLeft{from{left:100%}to{left:0%}}`}</style>
          </div>
        </Reveal>
        <div className="mt-4 mono text-[0.6rem] tracking-[0.3em] text-titanium/50" aria-live="polite">
          {dir === "out" ? "DNA ARCHIVE → CACHE → PHONE · retrieving vacation.jpg" : "PHONE → CACHE → DNA ARCHIVE · archiving memory.jpg"}
        </div>
      </div>
    </Section>
  );
}
