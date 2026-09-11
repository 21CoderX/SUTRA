import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { scroll, ringScreen, useActiveScene, useUI, type SceneId } from "../store";

/**
 * Product orbit HUD. A telemetry ring that tracks the 3D ring's projected
 * screen position: scroll-synced progress arc, rotating tick marks, and four
 * cardinal spec labels that swap with staggered anime.js transitions as the
 * story moves — every animation literally revolves around the product.
 */

const LABELS: Record<SceneId, [string, string, string, string]> = {
  hero: ["TITANIUM · CERAMIC", "SŪTRA — 001", "SCROLL TO EXPLORE", "SMRITI / MEMORY"],
  question: ["PHOTO · VIDEO · DOC", "6 FILE TYPES", "ORBITING ARCHIVE", "01 — QUESTION"],
  data: ["PIXELS → BITS", "ENCRYPTED STREAM", "COLLAPSE → RING", "02 — DATA"],
  dna: ["A · C · G · T", "FRAGMENTS 001–003", "ADDR · ECC · ×3", "03 — ENCODING"],
  explode: ["8 LAYERS", "DRAG TO ROTATE", "SELECT TO INSPECT", "04 — INSIDE"],
  archive: ["VACATION.JPG", "1,312 FRAGMENTS", "DNA ENCODED", "05 — ARCHIVE"],
  error: ["100 FRAGMENTS", "#037 DEGRADED", "RECONSTRUCTED", "06 — ECC"],
  vision: ["100 TB", "FUTURE TARGET", "25M PHOTOS", "07 — VISION"],
  auth: ["WEARER SENSE", "FINGER 02", "NON-INVASIVE", "08 — SECURITY"],
  wireless: ["BLE · NFC", "PHONE → DESKTOP", "NO CABLE", "09 — CONNECT"],
  app: ["SUTRA OS", "CACHE 64 GB", "PIPELINE SIM", "10 — APP"],
  cache: ["DNA ARCHIVE", "CACHE LAYER", "APP INTERFACE", "11 — CACHE"],
  reality: ["REAL TODAY", "9 PROVEN", "6 FUTURE", "12 — REALITY"],
  why: ["A · ADENINE", "C · G · T", "DENSE · STABLE", "13 — SCIENCE"],
  visualizer: ["72 FRAGMENTS", "CLICK A RUNG", "ABSTRACT DATA", "14 — INSPECT"],
  zoom: ["MACRO → MICRO", "1 M → 2 NM", "HAND → PHOTO", "15 — SCALE"],
  about: ["WEARABLE", "MOLECULAR", "PERSONAL", "16 — WHY"],
  roadmap: ["01 CONCEPT", "→ 05 SUTRA", "NO DATES", "17 — ROADMAP"],
  final: ["THE THREAD", "OF MEMORY", "SUTRA", "18 — SUTRA"],
};

const TICKS = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const major = i % 6 === 0;
  const r1 = major ? 0.962 : 0.982;
  return { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a), y2: Math.sin(a), major };
});

export function RingHUD() {
  const scene = useActiveScene();
  const webgl = useUI((s) => s.webgl);
  const menu = useUI((s) => s.menuOpen);
  const [display, setDisplay] = useState<SceneId>(scene);
  const shown = useRef(scene);
  const wrap = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const base = useRef<SVGCircleElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const ticks = useRef<SVGGElement>(null);
  const labelEls = useRef<(HTMLSpanElement | null)[]>([]);

  // intro
  useEffect(() => {
    if (!webgl || !intro.current) return;
    const r = document.documentElement.classList.contains("reduced");
    animate(intro.current, {
      opacity: [0, 1],
      scale: [0.94, 1],
      duration: r ? 0 : 1600,
      ease: "outExpo",
      delay: r ? 0 : 700,
    });
  }, [webgl]);

  // label swap: stagger out → swap → stagger in
  useEffect(() => {
    if (scene === shown.current) return;
    const r = document.documentElement.classList.contains("reduced");
    const els = labelEls.current.filter(Boolean) as HTMLSpanElement[];
    animate(els, {
      opacity: 0,
      y: -6,
      duration: r ? 0 : 200,
      ease: "inQuad",
      delay: stagger(25),
      onComplete: () => {
        shown.current = scene;
        setDisplay(scene);
      },
    });
  }, [scene]);
  useEffect(() => {
    const r = document.documentElement.classList.contains("reduced");
    const els = labelEls.current.filter(Boolean) as HTMLSpanElement[];
    if (!els.length) return;
    animate(els, {
      opacity: [0, 1],
      y: [8, 0],
      duration: r ? 0 : 650,
      ease: "outExpo",
      delay: stagger(55),
    });
  }, [display]);

  // per-frame: track the product, draw scroll progress, revolve ticks
  useEffect(() => {
    if (!webgl) return;
    let raf = 0;
    const tick = (now: number) => {
      const w = wrap.current;
      if (w) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const maxR = Math.min(vw, vh) * 0.46;
        const R = Math.max(84, Math.min(maxR, ringScreen.r * 1.22 + 20));
        const size = (R + 56) * 2;
        const c = size / 2;
        w.style.transform = `translate3d(${ringScreen.x}px,${ringScreen.y}px,0)`;
        const s = svg.current;
        if (s) {
          s.setAttribute("width", `${size}`);
          s.setAttribute("height", `${size}`);
          s.style.width = `${size}px`;
          s.style.height = `${size}px`;
        }
        const circ = 2 * Math.PI * R;
        if (base.current) {
          base.current.setAttribute("cx", `${c}`);
          base.current.setAttribute("cy", `${c}`);
          base.current.setAttribute("r", `${R}`);
        }
        if (arc.current) {
          arc.current.setAttribute("cx", `${c}`);
          arc.current.setAttribute("cy", `${c}`);
          arc.current.setAttribute("r", `${R}`);
          arc.current.setAttribute("stroke-dasharray", `${circ}`);
          arc.current.setAttribute("stroke-dashoffset", `${circ * (1 - scroll.local)}`);
          arc.current.setAttribute("transform", `rotate(-90 ${c} ${c})`);
        }
        const r = document.documentElement.classList.contains("reduced");
        if (ticks.current) {
          ticks.current.setAttribute(
            "transform",
            `translate(${c} ${c}) rotate(${r ? 0 : (now * 0.004) % 360}) scale(${R})`,
          );
        }
        // cardinal labels, clamped inside the viewport
        const L = labelEls.current;
        const est = (i: number) => (LABELS[shown.current][i].length * 7 + 18) / 2;
        const place = (i: number, lx: number, ly: number) => {
          const el = L[i];
          if (!el) return;
          const hw = est(i);
          const gx = ringScreen.x + (lx - c);
          const gy = ringScreen.y + (ly - c);
          const cxp = Math.max(hw + 8, Math.min(vw - hw - 8, gx)) - ringScreen.x + c;
          const cyp = Math.max(64, Math.min(vh - 64, gy)) - ringScreen.y + c;
          el.style.left = `${cxp}px`;
          el.style.top = `${cyp}px`;
        };
        place(0, c, c - R - 28);
        place(1, c + R + 48, c);
        place(2, c, c + R + 28);
        place(3, c - R - 48, c);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [webgl]);

  if (!webgl) return null;
  const L = LABELS[display];
  const setL = (i: number) => (el: HTMLSpanElement | null) => {
    labelEls.current[i] = el;
  };
  return (
    <div
      className={`pointer-events-none fixed left-0 top-0 z-[6] transition-opacity duration-700 ${menu ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      <div ref={wrap} className="absolute left-0 top-0 will-change-transform">
        <div className="absolute" style={{ transform: "translate(-50%,-50%)" }}>
          <div ref={intro} className="hud-intro relative opacity-0">
            <svg ref={svg} className="block overflow-visible">
              <circle ref={base} fill="none" stroke="rgba(185,192,200,0.20)" strokeWidth="1" />
              <g ref={ticks} fill="none" stroke="rgba(185,192,200,0.4)" strokeWidth="1" vectorEffect="non-scaling-stroke">
                {TICKS.map((t, i) => (
                  <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} opacity={t.major ? 0.9 : 0.4} />
                ))}
              </g>
              <circle ref={arc} fill="none" stroke="#7fd3e6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span ref={setL(0)} className="hud-label flex">
              {L[0]}
            </span>
            <span ref={setL(1)} className="hud-label hidden sm:flex">
              {L[1]}
            </span>
            <span ref={setL(2)} className="hud-label flex">
              {L[2]}
            </span>
            <span ref={setL(3)} className="hud-label hidden sm:flex">
              {L[3]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
