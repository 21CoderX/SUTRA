import { useEffect, useRef, useState } from "react";
import { Section, Reveal, Eyebrow, Tag } from "./ui";
import { useLocal } from "./Story";
import { useUI } from "../store";

type AuthState = "idle" | "detected" | "position" | "key" | "granted" | "mismatch" | "locked";

const FINGERS = [
  { id: 0, x: 62, h: 150, w: 30 },
  { id: 1, x: 100, h: 178, w: 32 }, // registered: index → we choose finger 1 as "registered"
  { id: 2, x: 140, h: 190, w: 32 },
  { id: 3, x: 180, h: 170, w: 30 },
];
const REGISTERED = 1;

export function Authentication() {
  const [finger, setFinger] = useState<number | null>(null);
  const [state, setState] = useState<AuthState>("idle");
  const timers = useRef<number[]>([]);
  const reduced = useUI((s) => s.reduced);
  const l = useLocal(8, 10);
  const autoRan = useRef(false);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const run = (f: number) => {
    clear();
    setFinger(f);
    const d = reduced ? 250 : 650;
    const seq: AuthState[] = f === REGISTERED ? ["detected", "position", "key", "granted"] : ["detected", "mismatch", "locked"];
    setState("idle");
    seq.forEach((s, i) => timers.current.push(window.setTimeout(() => setState(s), d * (i + 1))));
  };
  useEffect(() => clear, []);
  useEffect(() => {
    if (!autoRan.current && l > 0.15 && l < 1) {
      autoRan.current = true;
      run(REGISTERED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l]);

  const ok = state === "granted";
  const bad = state === "locked" || state === "mismatch";
  const lines: [AuthState, string][] = [
    ["detected", "WEARER DETECTED"],
    ["position", "FINGER POSITION VERIFIED"],
    ["key", "SECURE KEY VERIFIED"],
  ];
  const badLines: [AuthState, string][] = [
    ["detected", "WEARER DETECTED"],
    ["mismatch", "POSITION MISMATCH"],
  ];
  const order: AuthState[] = ["idle", "detected", "position", "key", "granted"];
  const badOrder: AuthState[] = ["idle", "detected", "mismatch", "locked"];
  const seqNow = finger === REGISTERED ? order : badOrder;
  const idx = seqNow.indexOf(state);

  return (
    <Section id="security" scene="auth" height={240} align="left" label="Authentication">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <div>
          <Reveal>
            <Eyebrow>08 — SECURITY</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display mt-6 text-[clamp(2.2rem,5vw,4.4rem)] text-soft">
              The ring knows
              <br />
              <span className="text-titanium/70">it's you.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-md text-sm text-titanium/70">
              The concept combines physical possession, wearer verification, finger-position sensing and cryptographic
              authentication. Sensing is non-invasive: nothing is taken from the wearer, and human DNA is never used as
              a key or as storage.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-6 flex flex-wrap gap-3" data-nodrag>
              <button className="btn" onClick={() => run(REGISTERED)}>
                Place on registered finger
              </button>
              <button className="btn" onClick={() => run(2)}>
                Try another finger
              </button>
            </div>
          </Reveal>
          <div className="mt-8 min-h-[7.5rem]" aria-live="polite" data-nodrag>
            {(finger === REGISTERED ? lines : finger === null ? [] : badLines).map(([s, label], i) => {
              const on = idx >= seqNow.indexOf(s);
              const isBad = s === "mismatch";
              return (
                <div key={s} className={`flex items-center gap-3 py-1 transition-all duration-500 ${on ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isBad ? "bg-red-400" : "bg-accent"}`} />
                  <span className={`mono text-[0.68rem] tracking-[0.3em] ${isBad ? "text-red-300" : "text-soft"}`}>{label}</span>
                </div>
              );
            })}
            <div className={`display mt-3 text-[clamp(1.8rem,4vw,3.2rem)] transition-all duration-700 ${ok || bad ? "opacity-100" : "opacity-0"} ${ok ? "text-soft" : "text-red-300"}`}>
              {ok ? "ACCESS GRANTED" : state === "locked" ? "ACCESS LOCKED" : "\u00A0"}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm" data-nodrag>
          <svg viewBox="0 0 250 300" className="w-full" role="img" aria-label="Stylized hand showing the ring on the registered finger">
            <defs>
              <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a2f36" />
                <stop offset="1" stopColor="#15181c" />
              </linearGradient>
              <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6d7480" />
                <stop offset="0.5" stopColor="#e6eaee" />
                <stop offset="1" stopColor="#7b828d" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* palm */}
            <path d="M52 300 L52 190 Q52 150 90 150 L200 150 Q225 150 225 175 L225 300 Z" fill="url(#skin)" stroke="rgba(185,192,200,0.25)" />
            {/* thumb */}
            <rect x="12" y="170" width="34" height="110" rx="17" fill="url(#skin)" stroke="rgba(185,192,200,0.25)" transform="rotate(-25 29 225)" />
            {/* fingers */}
            {FINGERS.map((f) => (
              <g key={f.id}>
                <rect x={f.x - f.w / 2} y={190 - f.h} width={f.w} height={f.h + 10} rx={f.w / 2} fill="url(#skin)" stroke="rgba(185,192,200,0.25)" />
                {f.id === REGISTERED && (
                  <text x={f.x} y={190 - f.h - 8} textAnchor="middle" fill="rgba(127,211,230,0.7)" fontFamily="monospace" fontSize="7" letterSpacing="2">
                    REGISTERED
                  </text>
                )}
                <rect x={f.x - f.w / 2} y={190 - f.h} width={f.w} height={f.h + 10} rx={f.w / 2} fill="transparent" style={{ cursor: "pointer" }} onClick={() => run(f.id)}>
                  <title>{`Place ring on finger ${f.id + 1}`}</title>
                </rect>
              </g>
            ))}
            {/* ring */}
            {finger !== null && (
              <g style={{ transition: "transform 0.7s cubic-bezier(0.2,0.7,0.2,1)", transform: `translate(${FINGERS[finger].x}px, 128px)` }}>
                <ellipse cx="0" cy="0" rx={FINGERS[finger].w / 2 + 4} ry="9" fill="none" stroke="url(#metal)" strokeWidth="7" />
                <ellipse cx="0" cy="0" rx={FINGERS[finger].w / 2 + 4} ry="9" fill="none" stroke={bad ? "#ff5c5c" : "#7fd3e6"} strokeWidth="1.2" opacity={state === "idle" ? 0 : ok || bad ? 0.9 : 0.5} filter="url(#glow)" style={{ transition: "opacity 0.5s" }} />
                {[0, 1, 2].map((k) => (
                  <ellipse key={k} cx="0" cy="0" rx={FINGERS[finger].w / 2 + 4} ry="9" fill="none" stroke={bad ? "#ff5c5c" : "#7fd3e6"} strokeWidth="0.8" opacity="0" style={{ transformOrigin: "0 0", animation: state !== "idle" && !reduced ? `pulseRing 2.2s ${k * 0.7}s ease-out infinite` : "none" }} />
                ))}
              </g>
            )}
            {/* sensor indicator */}
            {finger !== null && state !== "idle" && (
              <g transform={`translate(${FINGERS[finger].x}, 128)`} opacity="0.8">
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <circle key={k} cx={Math.cos((k / 6) * Math.PI * 2) * (FINGERS[finger].w / 2 + 4)} cy={Math.sin((k / 6) * Math.PI * 2) * 9} r="1.4" fill={bad ? "#ff5c5c" : "#a9e4f1"} style={{ animation: reduced ? "none" : `blink 1.2s ${k * 0.15}s infinite` }} />
                ))}
              </g>
            )}
          </svg>
          <div className="absolute left-0 top-0 flex gap-2">
            <Tag tone="accent">NON-INVASIVE SENSING</Tag>
          </div>
          <div className="absolute right-0 top-0">
            <Tag>CONCEPTUAL</Tag>
          </div>
        </div>
      </div>
    </Section>
  );
}

const DEVICES = [
  { name: "PHONE", w: 20, h: 36, r: 4, angle: -140 },
  { name: "TABLET", w: 34, h: 44, r: 4, angle: -40 },
  { name: "LAPTOP", w: 54, h: 34, r: 3, angle: 40 },
  { name: "DESKTOP", w: 60, h: 40, r: 3, angle: 140 },
];

export function Wireless() {
  const l = useLocal(9, 10);
  const reduced = useUI((s) => s.reduced);
  const linked = Math.min(4, Math.floor(l * 1.6 * 5));
  return (
    <Section scene="wireless" height={220} label="Wireless connection">
      <div className="relative w-full max-w-4xl text-center">
        <Reveal>
          <Eyebrow>09 — CONNECT</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-4 text-[clamp(2.4rem,6vw,5.4rem)] text-soft">No cable required.</h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-3 text-titanium/70">SUTRA connects wirelessly to your devices.</p>
        </Reveal>

        <div className="relative mx-auto mt-4 h-[46vh] max-h-[420px] w-full max-w-2xl" aria-hidden="true">
          <svg viewBox="-200 -160 400 320" className="h-full w-full">
            <defs>
              <linearGradient id="link" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="rgba(127,211,230,0)" />
                <stop offset="1" stopColor="rgba(127,211,230,0.8)" />
              </linearGradient>
            </defs>
            {DEVICES.map((d, i) => {
              const a = (d.angle * Math.PI) / 180;
              const R = 130;
              const x = Math.cos(a) * R, y = Math.sin(a) * R * 0.8;
              const on = i < linked;
              return (
                <g key={d.name}>
                  <line x1={0} y1={0} x2={x} y2={y} stroke={on ? "rgba(127,211,230,0.55)" : "rgba(185,192,200,0.12)"} strokeWidth="1" strokeDasharray="4 6" style={{ animation: on && !reduced ? "dash 1.4s linear infinite" : "none", transition: "stroke 0.6s" }} />
                  {on && !reduced && <circle r="2" fill="#a9e4f1"><animateMotion dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" path={`M0 0 L${x} ${y}`} /></circle>}
                  <rect x={x - d.w / 2} y={y - d.h / 2} width={d.w} height={d.h} rx={d.r} fill="#121417" stroke={on ? "rgba(127,211,230,0.7)" : "rgba(185,192,200,0.3)"} style={{ transition: "stroke 0.6s" }} />
                  {d.name === "LAPTOP" && <rect x={x - d.w / 2 - 6} y={y + d.h / 2} width={d.w + 12} height={3} rx={1} fill="#1c2025" stroke="rgba(185,192,200,0.3)" />}
                  {d.name === "DESKTOP" && <rect x={x - 8} y={y + d.h / 2} width={16} height={8} fill="#1c2025" stroke="rgba(185,192,200,0.3)" />}
                  <text x={x} y={y + d.h / 2 + 22} textAnchor="middle" fill={on ? "#eef1f4" : "rgba(185,192,200,0.5)"} fontFamily="monospace" fontSize="8" letterSpacing="2.5">
                    {d.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <Reveal delay={240}>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 text-left md:grid-cols-3">
            {[
              ["BLUETOOTH LOW ENERGY", "Pairing, authentication challenges and control traffic.", "RESEARCH-BASED"],
              ["NFC", "Tap-to-pair and short-range wake-up.", "RESEARCH-BASED"],
              ["HIGH-SPEED LINK", "Wi-Fi-class or UWB link for large transfers via the cache.", "FUTURE DESIGN"],
            ].map(([t, s, tag]) => (
              <div key={t} className="border-t border-titanium/15 pt-3">
                <div className="mono text-[0.62rem] tracking-[0.28em] text-soft">{t}</div>
                <div className="mt-1 text-xs text-titanium/60">{s}</div>
                <div className="mt-2">
                  <Tag tone={tag === "FUTURE DESIGN" ? "warn" : "accent"}>{tag}</Tag>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
