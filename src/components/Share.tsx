import { useState } from "react";
import { event } from "../lib/analytics";

/**
 * Social share row: native Web Share on capable devices, otherwise intent
 * URLs for X and LinkedIn plus copy-link. All share URLs are hash-routed.
 */
export function ShareRow({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const url = () => `${window.location.origin}${window.location.pathname}#/`;
  const title = "SUTRA — The Thread of Memory";
  const text = "A conceptual wearable molecular-memory ring: your digital life, archived in synthetic DNA.";

  const native = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: url() });
        event("share", "social", "native");
      } catch {
        /* user cancelled */
      }
    } else {
      await copy();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      window.prompt("Copy this link:", url());
    }
    setCopied(true);
    event("share", "social", "copy");
    setTimeout(() => setCopied(false), 2200);
  };

  const openIntent = (network: "x" | "linkedin") => {
    let intent: string;
    if (network === "x") {
      intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url())}`;
    } else {
      intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`;
    }
    window.open(intent, "_blank", "noopener,noreferrer,width=640,height=560");
    event("share", "social", network);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label="Share SUTRA">
      <span className="eyebrow mr-1 !text-[0.58rem]">Share</span>
      <button className="tag hover:border-soft/50 hover:text-soft" onClick={native}>
        {"share" in navigator ? "Share…" : copied ? "Link copied ✓" : "Copy link"}
      </button>
      <button className="tag hover:border-soft/50 hover:text-soft" onClick={() => openIntent("x")}>
        X / Twitter
      </button>
      <button className="tag hover:border-soft/50 hover:text-soft" onClick={() => openIntent("linkedin")}>
        LinkedIn
      </button>
    </div>
  );
}
