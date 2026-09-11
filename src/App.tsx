import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { scroll, pointer, SCENE_ORDER, setUI, useUI, getUI } from "./store";
import { Nav, Controls, CursorGlow, StaticRing, scrollToId } from "./components/Chrome";
import { RingHUD } from "./components/RingHUD";
import { ConsentBanner } from "./components/ConsentBanner";
import { Hero, Question, DigitalData, DNAEncoding } from "./components/Story";
import { ExplodedView, MolecularArchive, ErrorCorrection, Vision } from "./components/Hardware";
import { Authentication, Wireless } from "./components/Security";
import { Dashboard, CacheSection } from "./components/AppSections";
import { Reality, WhyDNA, DNAVisualizer, Zoom } from "./components/Science";
import { About, Roadmap, Final, Footer } from "./components/Closing";
import { initConsent } from "./lib/cookieConsent";
import { pageView } from "./lib/analytics";
import { applyMeta, initMetaManager, META } from "./lib/meta";

const Scene = lazy(() => import("./three/Scene"));
const PrivacyPage = lazy(() => import("./pages/Privacy").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/Terms").then((m) => ({ default: m.TermsPage })));
const FaqPage = lazy(() => import("./pages/Faq").then((m) => ({ default: m.FaqPage })));
const ContactPage = lazy(() => import("./pages/Contact").then((m) => ({ default: m.ContactPage })));
const EarlyAccessPage = lazy(() => import("./pages/EarlyAccess").then((m) => ({ default: m.EarlyAccessPage })));
const NotFoundPage = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFoundPage })));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    setUI({ webgl: false });
  }
  render() {
    return this.state.failed ? <StaticRing /> : this.props.children;
  }
}

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ---------------- hash routing ---------------- */

type Route = "home" | "privacy" | "terms" | "faq" | "contact" | "early-access" | "notfound";

function resolveHash(): Route {
  const h = location.hash.replace(/^#/, "");
  if (!h.startsWith("/")) return "home"; // "" or in-page anchors like #story
  const path = h.split("?")[0].replace(/\/+$/, "") || "/";
  switch (path) {
    case "/":
      return "home";
    case "/privacy":
      return "privacy";
    case "/terms":
      return "terms";
    case "/faq":
      return "faq";
    case "/contact":
      return "contact";
    case "/early-access":
      return "early-access";
    default:
      return "notfound";
  }
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(resolveHash);
  useEffect(() => {
    const onHash = () => {
      const next = resolveHash();
      setRoute(next);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

/* ---------------- scroll driver (experience only) ---------------- */

function useScrollDriver(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let lastT = 0;
    let lastTime = performance.now();
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    let els = sections();
    const ro = new ResizeObserver(() => (els = sections()));
    ro.observe(document.body);

    const tick = (now: number) => {
      const vh = window.innerHeight;
      const doc = document.documentElement.scrollHeight - vh;
      scroll.global = doc > 0 ? window.scrollY / doc : 0;
      let scene = 0;
      let local = 0;
      for (let i = 0; i < els.length; i++) {
        const r = els[i].getBoundingClientRect();
        const travel = Math.max(1, r.height - vh);
        if (r.top <= 0 && r.bottom > vh) {
          scene = SCENE_ORDER.indexOf(els[i].dataset.scene as (typeof SCENE_ORDER)[number]);
          local = Math.min(1, Math.max(0, -r.top / travel));
          break;
        }
        if (r.top > 0) {
          scene = Math.max(0, SCENE_ORDER.indexOf(els[i].dataset.scene as (typeof SCENE_ORDER)[number]) - 1);
          local = i === 0 ? 0 : 1;
          break;
        }
        scene = SCENE_ORDER.indexOf(els[i].dataset.scene as (typeof SCENE_ORDER)[number]);
        local = 1;
      }
      scroll.scene = scene;
      scroll.local = local;
      const t = scene + local;
      const dt = Math.max(1, now - lastTime) / 1000;
      const v = (t - lastT) / dt;
      scroll.velocity += (Math.max(-3, Math.min(3, v)) - scroll.velocity) * 0.1;
      scroll.t = t;
      lastT = t;
      lastTime = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [active]);
}

/* ---------------- branded intro veil ---------------- */

function IntroVeil() {
  const ready = useUI((s) => s.ready);
  const [minTime, setMinTime] = useState(false);
  const [failsafe, setFailsafe] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setMinTime(true), 1500);
    const b = setTimeout(() => setFailsafe(true), 5000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  const hide = (ready && minTime) || failsafe;
  useEffect(() => {
    if (!hide) return;
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [hide]);
  if (gone) return null;
  return (
    <div className={`intro-veil ${hide ? "hide" : ""}`} aria-hidden="true">
      <div className="word">
        {"SUTRA".split("").map((c, i) => (
          <span key={i} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>{c}</span>
        ))}
      </div>
      <div className="line" />
    </div>
  );
}

/* ---------------- the 3D product experience ---------------- */

function Experience() {
  const webgl = useUI((s) => s.webgl);
  useScrollDriver(true);

  // Judge-friendly chapter navigation: ← / → jump between story scenes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      if (!els.length) return;
      e.preventDefault();
      const next = e.key === "ArrowRight"
        ? Math.min(els.length - 1, scroll.scene + 1)
        : Math.max(0, scroll.scene - 1);
      els[next].scrollIntoView({ behavior: getUI().reduced ? "auto" : "smooth", block: "start" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {webgl ? (
        <SceneBoundary>
          <Suspense fallback={<StaticRing />}>
            <Scene />
          </Suspense>
        </SceneBoundary>
      ) : (
        <StaticRing />
      )}

      <CursorGlow />
      <RingHUD />
      <Nav />
      <Controls />

      <main className="relative z-10">
        <Hero />
        <Question />
        <DigitalData />
        <DNAEncoding />
        <ExplodedView />
        <MolecularArchive />
        <ErrorCorrection />
        <Vision />
        <Authentication />
        <Wireless />
        <Dashboard />
        <CacheSection />
        <Reality />
        <WhyDNA />
        <DNAVisualizer />
        <Zoom />
        <About />
        <Roadmap />
        <Final onExplore={() => scrollToId("technology")} onArchitecture={() => scrollToId("how")} />
      </main>
      <Footer />

      {/* Screen-reader summary of the essential scientific narrative */}
      <section className="sr-only" aria-label="Summary of SUTRA">
        <h2>SUTRA in one paragraph</h2>
        <p>
          SUTRA is a conceptual ring designed around the idea of storing digital memories in synthetic DNA. Files are
          encrypted, fragmented, protected with error correction, encoded as sequences of the nucleotides A, C, G and T,
          and archived in a sealed molecular chamber. The ring authenticates its wearer through non-invasive sensing and
          cryptography, connects wirelessly to devices, and uses a fast cache for everyday access while DNA serves as the
          long-term archive. DNA data storage exists in research today; a fully integrated ring-sized writer and reader is
          a future engineering vision.
        </p>
      </section>
    </>
  );
}

/* ---------------- app shell ---------------- */

export default function App() {
  const route = useRoute();
  const isHome = route === "home";

  useEffect(() => {
    const hasWebgl = detectWebGL();
    setUI({ webgl: hasWebgl, ready: hasWebgl ? getUI().ready : true });
    document.documentElement.classList.toggle("reduced", getUI().reduced);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    initMetaManager();
    initConsent();
  }, []);

  useEffect(() => {
    const map = {
      home: META.home,
      privacy: META.privacy,
      terms: META.terms,
      faq: META.faq,
      contact: META.contact,
      "early-access": META.earlyAccess,
      notfound: META.notFound,
    } as const;
    applyMeta(map[route]);
    pageView(location.hash || "/");
    if (route === "notfound") setUI({ menuOpen: false });
  }, [route]);

  return (
    <div className="relative min-h-screen bg-obsidian text-soft">
      <a
        href="#story"
        onClick={(e) => {
          if (isHome) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: getUI().reduced ? "auto" : "smooth" });
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-soft focus:px-3 focus:py-2 focus:text-obsidian"
      >
        Skip to story
      </a>

      {isHome ? (
        <>
          <IntroVeil />
          <Experience />
        </>
      ) : (
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center mono text-[0.6rem] tracking-[0.3em] text-titanium/50" role="status">
              LOADING
            </div>
          }
        >
          <main>
            {route === "privacy" && <PrivacyPage />}
            {route === "terms" && <TermsPage />}
            {route === "faq" && <FaqPage />}
            {route === "contact" && <ContactPage />}
            {route === "early-access" && <EarlyAccessPage />}
            {route === "notfound" && <NotFoundPage />}
          </main>
        </Suspense>
      )}

      <ConsentBanner />
    </div>
  );
}
