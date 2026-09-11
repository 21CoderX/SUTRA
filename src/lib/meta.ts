export interface MetaConfig {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
}

const baseTitle = "SUTRA — The Thread of Memory";
const baseDesc =
  "SUTRA is a conceptual wearable molecular-memory ring exploring how digital memories could be archived in synthetic DNA. A future engineering vision, not a currently available product.";

const metas = new Map<string, El>();

type El = HTMLMetaElement | HTMLLinkElement;

function setContent(el: HTMLMetaElement, content: string): void {
  el.content = content;
}
function setHref(el: HTMLLinkElement, href: string): void {
  el.href = href;
}

function createMetaEl(nameOrProperty: string): HTMLMetaElement {
  // Reuse tags already present in index.html instead of duplicating them.
  const attr = nameOrProperty.startsWith("name=")
    ? `meta[name="${CSS.escape(nameOrProperty.slice(5))}"]`
    : `meta[property="${CSS.escape(nameOrProperty.slice(9))}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(attr);
  if (existing) return existing;
  const el = document.createElement("meta");
  if (nameOrProperty.startsWith("name=")) {
    el.name = nameOrProperty.slice("name=".length);
  } else if (nameOrProperty.startsWith("property=")) {
    el.setAttribute("property", nameOrProperty.slice("property=".length));
  }
  document.head.appendChild(el);
  return el;
}

function createLinkEl(rel: string): HTMLLinkElement {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (existing) return existing;
  const el = document.createElement("link");
  el.rel = rel;
  document.head.appendChild(el);
  return el;
}

export function applyMeta(cfg: MetaConfig) {
  document.title = cfg.title.includes("SUTRA") ? cfg.title : `${cfg.title} — SUTRA`;

  upsert("name=description", cfg.description);
  upsert("name=robots", "index, follow");
  upsert("name=author", "SUTRA — The Thread of Memory");
  upsert("name=theme-color", "#050607");

  upsert("property=og:title", cfg.title);
  upsert("property=og:description", cfg.description);
  upsert("property=og:type", cfg.ogType ?? "website");
  upsert("property=og:url", cfg.canonical ?? document.location.href);
  upsert("property=og:image", cfg.ogImage ?? "/og-image.png");
  upsert("property=og:site_name", "SUTRA");

  upsert("name=twitter:title", cfg.title);
  upsert("name=twitter:description", cfg.description);
  upsert("name=twitter:card", cfg.twitterCard ?? "summary_large_image");
  upsert("name=twitter:image", cfg.ogImage ?? "/og-image.png");

  upsertLink("canonical", cfg.canonical ?? document.location.href);
}

function upsert(key: string, content: string) {
  const el = metas.get(key) ?? createMetaEl(key);
  if (el instanceof HTMLMetaElement) setContent(el, content);
  metas.set(key, el);
}

function upsertLink(rel: string, href: string) {
  const key = `link:${rel}`;
  const el = metas.get(key) ?? createLinkEl(rel);
  if (el instanceof HTMLLinkElement) setHref(el, href);
  (el as HTMLLinkElement).id = key;
  metas.set(key, el);
}

export function initMetaManager() {
  applyMeta({
    title: baseTitle,
    description: baseDesc,
    canonical: document.location.href,
    ogImage: "/og-image.png",
    ogType: "website",
    twitterCard: "summary_large_image",
  });
}

export const META = {
  home: {
    title: baseTitle,
    description: baseDesc,
    canonical: document.location.origin + "/",
    ogImage: "/og-image.png",
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How the SUTRA concept website handles information. A conceptual product exploration — no personal data is collected during normal visits. Read our privacy policy.",
    canonical: document.location.origin + "/#/privacy",
    ogType: "article",
    twitterCard: "summary",
  },
  terms: {
    title: "Terms of Use",
    description:
      "Terms of use for the SUTRA concept website. SUTRA is a conceptual exploration and is not a currently available product. By using the site, you accept these terms.",
    canonical: document.location.origin + "/#/terms",
    ogType: "article",
    twitterCard: "summary",
  },
  faq: {
    title: "FAQ — SUTRA",
    description:
      "Frequently asked questions about SUTRA, the conceptual wearable molecular-memory ring. What is stored, how it works, what exists today, and what is future engineering.",
    canonical: document.location.origin + "/#/faq",
    ogType: "article",
    twitterCard: "summary",
  },
  contact: {
    title: "Contact — SUTRA",
    description:
      "Contact the SUTRA concept team. Ask questions, request updates, or flag something that should be clearer. No biometric or DNA information is requested or stored.",
    canonical: document.location.origin + "/#/contact",
    ogType: "website",
    twitterCard: "summary",
  },
  earlyAccess: {
    title: "Early Access — SUTRA",
    description:
      "Save your interest in SUTRA, the conceptual wearable molecular-memory ring. If there is ever a concrete update or launch, we will be in touch. No product is sold here.",
    canonical: document.location.origin + "/#/early-access",
    ogType: "website",
    twitterCard: "summary",
  },
  notFound: {
    title: "Page not found — SUTRA",
    description:
      "The page you asked for does not exist on the SUTRA site. Return to the story, or browse the privacy policy, terms, FAQ, or contact page.",
    canonical: document.location.origin + "/",
    ogType: "website",
    twitterCard: "summary",
  },
} as const;
