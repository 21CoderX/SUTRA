import { useEffect, useRef, useState } from "react";
import { setUI, useUI, useActiveScene, SCENE_ORDER, scroll } from "../store";

const LINKS = [
  ["Story", "story"],
  ["How It Works", "how"],
  ["Technology", "technology"],
  ["Security", "security"],
  ["Future", "future"],
  ["About", "about"],
  ["FAQ", "__faq"],
];

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = document.documentElement.classList.contains("reduced");
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function Nav() {
  const menuOpen = useUI((s) => s.menuOpen);
  const scene = useActiveScene();
  const idx = SCENE_ORDER.indexOf(scene);
  const hidden = idx === 0 && scroll.local < 0.05;
  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (id === "__faq") {
      location.hash = "#/faq";
      return;
    }
    scrollToId(id);
  };
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 md:px-10 md:py-5 transition-opacity duration-700 ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`} data-nodrag>
        <a
          href="#story"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="mono text-[0.78rem] tracking-[0.45em] text-soft"
          aria-label="SUTRA — back to top"
        >
          SUTRA
        </a>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {LINKS.map(([label, id]) => (
            <a
              key={id}
              href={id === "__faq" ? "#/faq" : `#${id}`}
              onClick={(e) => go(e, id)}
              className="mono text-[0.6rem] tracking-[0.3em] uppercase text-titanium/70 transition-colors hover:text-soft"
            >
              {label}
            </a>
          ))}
          <a
            href="#/early-access"
            onClick={() => import("../lib/analytics").then((m) => m.event("cta_click", "nav", "early-access"))}
            className="mono ml-2 rounded-full border border-soft/40 px-4 py-2 text-[0.58rem] tracking-[0.28em] uppercase text-soft transition-colors hover:bg-soft hover:text-obsidian"
          >
            Early access
          </a>
        </nav>
        <button className="mono text-[0.6rem] tracking-[0.3em] text-soft lg:hidden" onClick={() => setUI({ menuOpen: !menuOpen })} aria-expanded={menuOpen} aria-controls="mobile-menu">
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
      </header>
      {/* progress rail */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1.5 md:flex" aria-hidden="true">
        {SCENE_ORDER.map((s, i) => (
          <span key={s} className={`block h-3 w-px transition-all duration-500 ${i === idx ? "bg-accent h-5" : i < idx ? "bg-soft/50" : "bg-titanium/20"}`} />
        ))}
      </div>
      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-30 flex flex-col justify-center gap-5 overflow-y-auto bg-obsidian/95 px-10 py-16 backdrop-blur lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          {LINKS.map(([label, id], i) => (
            <a
              key={id}
              href={id === "__faq" ? "#/faq" : `#${id}`}
              onClick={(e) => {
                setUI({ menuOpen: false });
                if (id === "__faq") {
                  location.hash = "#/faq";
                } else {
                  e.preventDefault();
                  scrollToId(id);
                }
              }}
              className="display text-4xl text-soft anim-fadeUp"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {label}
            </a>
          ))}
          <a
            href="#/early-access"
            onClick={() => setUI({ menuOpen: false })}
            className="btn solid mt-4 w-fit anim-fadeUp"
            style={{ animationDelay: `${LINKS.length * 60}ms` }}
          >
            Request early access
          </a>
          <div className="mt-4 flex gap-5 eyebrow">
            <a href="#/contact" onClick={() => setUI({ menuOpen: false })}>Contact</a>
            <a href="#/privacy" onClick={() => setUI({ menuOpen: false })}>Privacy</a>
            <a href="#/terms" onClick={() => setUI({ menuOpen: false })}>Terms</a>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Ambient sound (WebAudio, user-initiated) ---------- */
class Ambience {
  ctx: AudioContext | null = null;
  gain: GainNode | null = null;
  start() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      const g = this.ctx.createGain();
      g.gain.value = 0;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 220;
      [55, 55.6, 110.3].forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        o.type = i === 2 ? "triangle" : "sine";
        o.frequency.value = f;
        const og = this.ctx!.createGain();
        og.gain.value = i === 2 ? 0.25 : 1;
        o.connect(og).connect(lp);
        o.start();
      });
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoG = this.ctx.createGain();
      lfoG.gain.value = 60;
      lfo.connect(lfoG).connect(lp.frequency);
      lfo.start();
      lp.connect(g).connect(this.ctx.destination);
      this.gain = g;
    }
    this.ctx.resume();
    this.gain!.gain.setTargetAtTime(0.06, this.ctx.currentTime, 1.2);
  }
  stop() {
    if (!this.ctx || !this.gain) return;
    this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
  }
  ping() {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
    o.connect(g).connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + 0.7);
  }
}
export const ambience = new Ambience();

/* ---------- Bottom-left controls: demo, sound, motion ---------- */
export function Controls() {
  const sound = useUI((s) => s.sound);
  const reduced = useUI((s) => s.reduced);
  const demo = useUI((s) => s.demo);
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced", reduced);
  }, [reduced]);

  // Demo mode: auto-scroll the story, interrupted by any user input
  useEffect(() => {
    if (!demo) return;
    const startY = window.scrollY;
    const endY = document.documentElement.scrollHeight - window.innerHeight;
    const remaining = Math.max(0, endY - startY);
    const duration = Math.max(20000, (remaining / endY) * (reduced ? 70000 : 150000));
    const t0 = performance.now();
    const stop = (e?: Event) => {
      if (e && (e.target as HTMLElement)?.closest?.("[data-demo-control]")) return;
      setUI({ demo: false });
    };
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / duration);
      // ease per-frame for gentle dwell around section starts
      window.scrollTo(0, startY + remaining * u);
      setProgress(u);
      if (u < 1) raf.current = requestAnimationFrame(tick);
      else stop();
    };
    raf.current = requestAnimationFrame(tick);
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchstart", stop, opts);
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
    };
  }, [demo, reduced]);

  const toggleSound = () => {
    if (sound) ambience.stop();
    else ambience.start();
    setUI({ sound: !sound });
  };

  const startDemo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demo) {
      setUI({ demo: false });
    } else {
      import("../lib/analytics").then((m) => m.event("demo_start", "experience", "play"));
      window.scrollTo({ top: 0 });
      setTimeout(() => setUI({ demo: true }), 50);
    }
  };

  return (
    <div
      className="fixed bottom-4 left-3 right-3 z-40 flex items-center gap-1.5 sm:left-5 sm:right-auto sm:gap-2 md:bottom-5"
      data-nodrag
      data-demo-control
      role="toolbar"
      aria-label="Experience controls"
    >
      <button
        onClick={startDemo}
        className={`glass flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 mono text-[0.52rem] tracking-[0.2em] transition-colors sm:flex-none sm:px-4 sm:text-[0.58rem] sm:tracking-[0.28em] ${demo ? "text-accent" : "text-titanium/80 hover:text-soft"}`}
        aria-pressed={demo}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${demo ? "bg-accent" : "bg-titanium/50"}`} style={demo ? { animation: "blink 1.2s infinite" } : undefined} />
        {demo ? `DEMO ${Math.round(progress * 100)}% · STOP` : "PLAY FULL EXPERIENCE"}
      </button>
      <button
        onClick={toggleSound}
        className={`glass rounded-full px-3 py-2.5 mono text-[0.52rem] tracking-[0.2em] sm:px-3 sm:text-[0.58rem] sm:tracking-[0.25em] ${sound ? "text-accent" : "text-titanium/70 hover:text-soft"}`}
        aria-pressed={sound}
        aria-label={sound ? "Mute ambient sound" : "Enable ambient sound"}
      >
        <span className="sm:hidden" aria-hidden>{sound ? "♪ ON" : "♪ OFF"}</span>
        <span className="hidden sm:inline">{sound ? "SOUND ON" : "SOUND OFF"}</span>
      </button>
      <button
        onClick={() => {
          setUI({ reduced: !reduced });
          import("../lib/analytics").then((m) => m.event("reduced_motion", "accessibility", String(!reduced)));
        }}
        className={`glass rounded-full px-3 py-2.5 mono text-[0.52rem] tracking-[0.2em] sm:px-3 sm:text-[0.58rem] sm:tracking-[0.25em] ${reduced ? "text-accent" : "text-titanium/70 hover:text-soft"}`}
        aria-pressed={reduced}
        aria-label={reduced ? "Turn full motion back on" : "Switch to reduced motion mode"}
      >
        <span className="sm:hidden" aria-hidden>{reduced ? "RM" : "FX"}</span>
        <span className="hidden sm:inline">{reduced ? "REDUCED MOTION" : "MOTION"}</span>
      </button>
      <span className="mono hidden pl-2 text-[0.52rem] tracking-[0.25em] text-titanium/35 lg:inline" aria-hidden="true">
        ← → CHAPTERS
      </span>
    </div>
  );
}

/* ---------- Cursor glow (desktop only) ---------- */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div ref={ref} className="cursor-glow hidden md:block" aria-hidden="true" />;
}

/* ---------- Static fallback when WebGL is unavailable ---------- */
export function StaticRing() {
  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center"
      role="img"
      aria-label="Slowly rotating metallic SUTRA ring on a dark background. The interactive 3D experience is unavailable because WebGL could not be started; all content remains readable below."
    >
      <div className="relative h-[52vmin] w-[52vmin]" style={{ animation: "spinSlow 60s linear infinite" }} aria-hidden="true">
        <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 120deg, #6d7480, #e6eaee 25%, #7b828d 50%, #d3d8de 75%, #6d7480)", boxShadow: "0 0 80px rgba(127,211,230,0.08), inset 0 0 40px rgba(0,0,0,0.6)" }} />
        <div className="absolute inset-[15%] rounded-full bg-obsidian" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.8)" }} />
      </div>
      <div className="absolute bottom-24 mono text-[0.58rem] tracking-[0.3em] text-titanium/40" aria-hidden="true">STATIC RENDER · WEBGL UNAVAILABLE</div>
    </div>
  );
}
