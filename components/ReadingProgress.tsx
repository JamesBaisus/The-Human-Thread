"use client";

import { useEffect, useState } from "react";
import { saveProgress, getResume, clearResume } from "@/lib/reading";

/**
 * Remembers how far the visitor read this article and, on a later visit,
 * offers a gentle "pick up where you left off" prompt. Nothing scrolls on its
 * own — the reader chooses to resume — so it never fights the entrance
 * animations or disorients someone who came back to re-read from the top.
 */
export default function ReadingProgress({
  slug,
  title,
  category,
}: {
  slug: string;
  title: string;
  category: string;
}) {
  const [resumePct, setResumePct] = useState<number | null>(null);

  // Offer to resume — read once on mount, before any scroll can overwrite it.
  useEffect(() => {
    const pct = getResume(slug);
    if (pct != null) setResumePct(pct);
  }, [slug]);

  // Save progress as the reader moves through the piece.
  useEffect(() => {
    const scrolled = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const save = () => saveProgress(slug, title, category, scrolled());

    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { save(); raf = 0; });
    };
    const onLeave = () => { if (document.visibilityState === "hidden") save(); };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [slug, title, category]);

  if (resumePct == null) return null;

  const resume = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: resumePct * max, behavior: reduced ? "auto" : "smooth" });
    setResumePct(null);
  };

  const dismiss = () => {
    clearResume(slug);
    setResumePct(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-[clamp(16px,3vw,30px)] z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 max-w-[92vw] bg-ink text-ondark rounded-[3px] shadow-[0_12px_44px_rgba(0,0,0,.28)] pl-5 pr-3 py-[11px] animate-[modup_0.5s_cubic-bezier(0.16,0.8,0.3,1)_both]">
        <div className="min-w-0">
          <div className="font-hanken text-[9px] font-bold tracking-[.24em] uppercase text-[rgba(245,245,245,.55)]">
            Continue reading
          </div>
          <div className="font-playfair text-[15px] leading-tight truncate max-w-[46vw]">
            You left off {Math.round(resumePct * 100)}% through
          </div>
        </div>
        <button
          onClick={resume}
          className="flex-none font-hanken text-[10px] font-bold tracking-[.16em] uppercase bg-ondark text-ink rounded-[2px] py-[9px] px-4 cursor-pointer transition-transform hover:-translate-y-px"
        >
          Resume →
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-none text-[rgba(245,245,245,.55)] hover:text-ondark px-[6px] text-[20px] leading-none cursor-pointer transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
