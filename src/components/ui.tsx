import { useEffect, useRef, type ReactNode, type HTMLAttributes } from "react";
import { animate, stagger } from "animejs";
import type { SceneId } from "../store";

/**
 * anime.js motion layer.
 * - Reveal: scroll-triggered expo reveal, optionally staggering its children.
 * - Split: signature staggered headline — splits text into chars and ripples them in.
 * Discrete transitions run through anime.js; continuous scroll-synced motion
 * stays in rAF (HUD orbit, progress arcs) for buttery 60fps.
 */

const isReduced = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("reduced");

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "h1" | "h2" | "h3" | "span" | "li" | "ul" | "ol";
  y?: number;
  staggerChildren?: boolean;
} & HTMLAttributes<HTMLElement>;

export function Reveal({ children, className = "", delay = 0, as: Tag = "div", y = 28, staggerChildren = false, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const r = isReduced();
          if (staggerChildren) {
            const kids = Array.from(el.children) as HTMLElement[];
            kids.forEach((k) => (k.style.opacity = "0"));
            el.style.opacity = "1";
            animate(kids, {
              opacity: [0, 1],
              y: [r ? 0 : y, 0],
              duration: r ? 150 : 900,
              ease: "outExpo",
              delay: stagger(r ? 0 : 70, { start: r ? 0 : delay }),
            });
          } else {
            animate(el, {
              opacity: [0, 1],
              y: [r ? 0 : y, 0],
              duration: r ? 150 : 1100,
              ease: "outExpo",
              delay: r ? 0 : delay,
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y, staggerChildren]);
  const T = Tag as unknown as "div";
  return (
    <T ref={ref as React.RefObject<HTMLDivElement>} className={className} {...(rest as Record<string, unknown>)}>
      {children}
    </T>
  );
}

/** Staggered split-text headline. Use "\n" for line breaks. */
export function Split({
  text,
  className = "",
  as: Tag = "div",
  delay = 0,
  staggerMs = 24,
  y = 44,
}: {
  text: string;
  className?: string;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  staggerMs?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("aria-label", text.replace(/\n/g, " "));
    el.innerHTML = "";
    const chars: HTMLSpanElement[] = [];
    text.split("\n").forEach((line) => {
      const lineEl = document.createElement("span");
      lineEl.style.display = "block";
      line.split(" ").forEach((word, wi, arr) => {
        const w = document.createElement("span");
        w.style.display = "inline-block";
        w.style.whiteSpace = "nowrap";
        [...word].forEach((ch) => {
          const c = document.createElement("span");
          c.className = "split-char";
          c.textContent = ch;
          c.setAttribute("aria-hidden", "true");
          c.style.opacity = "0";
          w.appendChild(c);
          chars.push(c);
        });
        lineEl.appendChild(w);
        if (wi < arr.length - 1) lineEl.appendChild(document.createTextNode(" "));
      });
      el.appendChild(lineEl);
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const r = isReduced();
          animate(chars, {
            opacity: [0, 1],
            y: [r ? 0 : y, 0],
            rotate: [r ? 0 : 5, 0],
            duration: r ? 150 : 1050,
            ease: "outExpo",
            delay: stagger(r ? 0 : staggerMs, { start: r ? 0 : delay }),
          });
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, delay, staggerMs, y]);
  const T = Tag as unknown as "div";
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={className} />;
}

/** A full-height story beat. `height` in viewport units controls scroll dwell. */
export function Section({
  id,
  scene,
  height = 160,
  children,
  className = "",
  align = "center",
  label,
}: {
  id?: string;
  scene: SceneId;
  height?: number;
  children: ReactNode;
  className?: string;
  align?: "center" | "left" | "right" | "bottom";
  label?: string;
}) {
  const alignCls =
    align === "left"
      ? "items-center justify-start"
      : align === "right"
        ? "items-center justify-end"
        : align === "bottom"
          ? "items-end justify-center pb-24"
          : "items-center justify-center";
  const scrim =
    align === "left"
      ? "bg-gradient-to-r from-obsidian/90 via-obsidian/45 to-transparent"
      : align === "right"
        ? "bg-gradient-to-l from-obsidian/90 via-obsidian/45 to-transparent"
        : align === "bottom"
          ? "bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent"
          : "bg-[radial-gradient(ellipse_at_center,rgba(5,6,7,0.72)_0%,rgba(5,6,7,0.28)_46%,transparent_72%)]";
  return (
    <section
      id={id}
      data-scene={scene}
      aria-label={label}
      className={`relative w-full ${className}`}
      style={{ minHeight: `${height}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className={`pointer-events-none absolute inset-0 ${scrim}`} aria-hidden="true" />
        <div className={`relative z-10 flex h-full w-full px-6 md:px-14 lg:px-24 ${alignCls}`}>{children}</div>
      </div>
    </section>
  );
}

export function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "warn" }) {
  return <span className={`tag ${tone === "accent" ? "accent" : tone === "warn" ? "warn" : ""}`}>{children}</span>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`}>{children}</div>;
}

export function Callout({ title, sub, tag, tone }: { title: string; sub: string; tag?: string; tone?: "default" | "accent" | "warn" }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-2 block h-px w-8 bg-titanium/40" />
      <div>
        <div className="mono text-[0.7rem] tracking-[0.28em] text-soft">{title}</div>
        <div className="mt-1 text-sm text-titanium/70">{sub}</div>
        {tag && (
          <div className="mt-2">
            <Tag tone={tone}>{tag}</Tag>
          </div>
        )}
      </div>
    </div>
  );
}

export function Pipeline({ steps, active = -1, vertical = false }: { steps: string[]; active?: number; vertical?: boolean }) {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (active < 0 || active >= steps.length) return;
    const el = list.current?.querySelector(`[data-i="${active}"]`);
    if (el && !isReduced()) {
      animate(el as HTMLElement, { scale: [1.14, 1], duration: 650, ease: "outExpo" });
    }
  }, [active, steps.length]);
  return (
    <ol ref={list} className={`flex ${vertical ? "flex-col gap-2" : "flex-wrap items-center gap-2"}`} aria-label="Data pipeline">
      {steps.map((s, i) => {
        const done = active > i;
        const now = active === i;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              data-i={i}
              className={`mono inline-block text-[0.62rem] tracking-[0.24em] uppercase px-2.5 py-1.5 border rounded-sm transition-all duration-500 ${
                now
                  ? "border-accent/70 text-accent bg-accent/10"
                  : done
                    ? "border-soft/40 text-soft"
                    : "border-titanium/15 text-titanium/40"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && <span className={`text-titanium/30 ${vertical ? "hidden" : ""}`}>→</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function ScrollHint() {
  return (
    <div className="flex flex-col items-center gap-3 text-titanium/60">
      <span className="mono text-[0.6rem] tracking-[0.4em]">SCROLL TO EXPLORE</span>
      <span className="relative h-10 w-px overflow-hidden bg-titanium/20">
        <span className="absolute inset-x-0 top-0 h-4 bg-soft" style={{ animation: "scanline 2.2s ease-in-out infinite" }} />
      </span>
    </div>
  );
}
