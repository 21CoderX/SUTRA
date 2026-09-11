import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Centralized scene state. Scroll-driven values live in a mutable ref-like
 * object (read every frame by Three.js) so the DOM never re-renders on scroll.
 * Discrete UI state (selection, settings) uses a tiny external store.
 */

export type SceneId =
  | "hero"
  | "question"
  | "data"
  | "dna"
  | "explode"
  | "archive"
  | "error"
  | "vision"
  | "auth"
  | "wireless"
  | "app"
  | "cache"
  | "reality"
  | "why"
  | "visualizer"
  | "zoom"
  | "about"
  | "roadmap"
  | "final";

export const SCENE_ORDER: SceneId[] = [
  "hero", "question", "data", "dna", "explode", "archive", "error", "vision",
  "auth", "wireless", "app", "cache", "reality", "why", "visualizer", "zoom",
  "about", "roadmap", "final",
];

export interface ScrollFrame {
  /** 0..1 across entire page */
  global: number;
  /** index in SCENE_ORDER of the scene currently dominating the viewport */
  scene: number;
  /** 0..1 progress through that scene */
  local: number;
  /** continuous scene position: scene + local */
  t: number;
  /** velocity in scenes/second (smoothed) */
  velocity: number;
}

export const scroll: ScrollFrame = { global: 0, scene: 0, local: 0, t: 0, velocity: 0 };

/** Pointer, normalized -1..1 */
export const pointer = { x: 0, y: 0 };

/** Ring center projected to screen px + apparent radius (written every frame by the 3D rig) */
export const ringScreen = { x: 0, y: 0, r: 200 };

export interface RingComponent {
  id: string;
  label: string;
  short: string;
  what: string;
  why: string;
  status: "CONCEPTUAL" | "RESEARCH-BASED" | "FUTURE DESIGN";
  statusNote: string;
}

export const RING_COMPONENTS: RingComponent[] = [
  {
    id: "shell", label: "Outer Shell", short: "Titanium / ceramic housing",
    what: "A sealed, polished titanium and ceramic enclosure that protects every internal layer from moisture, shock and everyday wear.",
    why: "A molecular archive is only useful if it survives daily life. The shell defines how SUTRA feels and how long it lasts.",
    status: "RESEARCH-BASED", statusNote: "Sealed precision titanium and ceramic wearables are manufactured today.",
  },
  {
    id: "structure", label: "Protective Structure", short: "Internal load-bearing frame",
    what: "An internal carbon-composite frame that isolates the archive chamber from mechanical stress and temperature swings.",
    why: "Synthetic DNA is stable when kept dry, cool and protected. The frame makes those conditions consistent inside a ring.",
    status: "CONCEPTUAL", statusNote: "Encapsulated DNA preservation is studied in research; ring-scale frames are a design proposal.",
  },
  {
    id: "sensors", label: "Authentication Sensors", short: "Non-invasive wear sensing",
    what: "Capacitive and optical sensors on the inner band detect skin contact, finger geometry and ring position — nothing is extracted from the wearer.",
    why: "SUTRA should only open for the person wearing it, on the finger it was registered for.",
    status: "RESEARCH-BASED", statusNote: "Wearable contact, capacitive and optical sensors exist in shipping products.",
  },
  {
    id: "core", label: "Secure Processor", short: "Hardware-backed cryptographic identity",
    what: "A secure element holding cryptographic keys. It signs authentication challenges and encrypts everything before it is encoded.",
    why: "If the archive is encrypted at rest, a stolen ring is just an unreadable molecule.",
    status: "RESEARCH-BASED", statusNote: "Secure elements are standard in phones, cards and passports.",
  },
  {
    id: "wireless", label: "Wireless Link", short: "BLE · NFC · high-speed link",
    what: "A low-power Bluetooth and NFC layer for pairing and control, with a conceptual higher-bandwidth link for large transfers.",
    why: "No cable, no port. The ring stays sealed while your devices talk to it.",
    status: "RESEARCH-BASED", statusNote: "BLE and NFC in rings exist today; ring-scale high-speed radios are a future design goal.",
  },
  {
    id: "cache", label: "High-Speed Cache", short: "Fast solid-state working memory",
    what: "Conventional solid-state memory that holds recently used files so everyday access does not depend on molecular read-out.",
    why: "DNA is an archive, not a hard drive. The cache is what makes SUTRA feel instant.",
    status: "RESEARCH-BASED", statusNote: "Ring-sized flash memory is available today.",
  },
  {
    id: "archive", label: "Molecular Archive", short: "Synthetic DNA storage medium",
    what: "A sealed micro-chamber holding synthetic DNA that encodes your encrypted, error-corrected data as sequences of A, C, G and T.",
    why: "DNA offers extraordinary theoretical density and longevity — the reason SUTRA exists.",
    status: "FUTURE DESIGN", statusNote: "DNA data storage is real in laboratories. A ring-sized integrated writer/reader is a future engineering challenge.",
  },
  {
    id: "power", label: "Power System", short: "Micro-battery and wireless charging",
    what: "A curved solid-state micro-battery around the band, charged wirelessly through the shell.",
    why: "Sensing, encryption and wireless links all need energy, even if the DNA itself needs none.",
    status: "RESEARCH-BASED", statusNote: "Smart rings already ship with curved micro-batteries.",
  },
];

interface UIState {
  selected: string | null;
  reduced: boolean;
  sound: boolean;
  demo: boolean;
  webgl: boolean;
  menuOpen: boolean;
  dragRotation: number;
  /** true once the WebGL scene has produced its first frame */
  ready: boolean;
}

const prefersReduced =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let state: UIState = {
  selected: null,
  reduced: !!prefersReduced,
  sound: false,
  demo: false,
  webgl: true,
  menuOpen: false,
  dragRotation: 0,
  ready: false,
};

const listeners = new Set<() => void>();

export function setUI(patch: Partial<UIState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export function getUI() {
  return state;
}
export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}

/** Hook: subscribe a component to the currently-active scene (re-renders only on scene change). */
export function useActiveScene(): SceneId {
  const [scene, setScene] = useState<SceneId>("hero");
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      if (scroll.scene !== last) {
        last = scroll.scene;
        setScene(SCENE_ORDER[last]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return scene;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** progress of t inside [a,b] */
export const range = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
