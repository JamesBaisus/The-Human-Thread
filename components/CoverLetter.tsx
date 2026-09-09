"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

/** Aligns the first panel with the section heading above it. */
const LETTER_INSET = "max(calc((100vw - 1280px) / 2 + clamp(18px, 4vw, 54px)), clamp(18px, 4vw, 54px))";

/**
 * The letter to readers, read by moving sideways rather than down.
 *
 * Panels snap one at a time and can be driven by the arrows, the keyboard, a
 * trackpad swipe or a drag. It does not advance on its own: the editorials
 * pop-up autoplays because it is a picture gallery, but sliding a paragraph
 * out from under someone mid-sentence is a different matter.
 */
export default function CoverLetter() {
  const { eyebrow, title, panels } = site.letter;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[i] as HTMLElement | undefined;
    if (!target) return;
    const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({ left: target.offsetLeft - inset, behavior: "smooth" });
  }, []);

  const step = useCallback(
    (d: number) => goTo(Math.min(panels.length - 1, Math.max(0, active + d))),
    [active, goTo, panels.length]
  );

  // Which panel is under the left edge — drives the counter and the arrows.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const kids = Array.from(track.children) as HTMLElement[];
        const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const x = track.scrollLeft + inset + track.clientWidth * 0.28;
        let idx = 0;
        for (let i = 0; i < kids.length; i++) if (kids[i].offsetLeft <= x) idx = i;
        // The final panels cannot reach the start edge — there is no content
        // left to scroll past them — so hitting the end counts as the last one.
        const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
        setActive(atEnd ? kids.length - 1 : idx);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <section
      className="glossblack relative text-ondark overflow-hidden mt-[clamp(20px,3vw,36px)] py-[clamp(44px,6vw,86px)]"
      aria-roledescription="carousel"
      aria-label={title}
    >
      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)]">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-[clamp(26px,3.4vw,44px)]">
          <div data-reveal="left">
            <div className="font-ui text-[10px] font-black tracking-[.32em] uppercase text-[rgba(245,245,245,.62)] mb-[14px]">
              {eyebrow}
            </div>
            <h2 className="font-display font-black text-ondark text-[clamp(34px,5.6vw,78px)] leading-[.94] tracking-[-.02em] uppercase">
              {title}
            </h2>
          </div>

          <div data-reveal="" className="flex items-center gap-4">
            <span className="font-ui text-[11px] tracking-[.2em] text-[rgba(245,245,245,.5)] tabular-nums">
              {pad(active)} / {pad(panels.length - 1)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={active === 0}
                aria-label="Previous"
                className="letterbtn"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={active >= panels.length - 1}
                aria-label="Next"
                className="letterbtn"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKey}
        className="lettertrack"
        // the panels start under the heading, not flush to the viewport edge;
        // scroll-padding makes the snap points respect that same inset
        style={{
          paddingInline: LETTER_INSET,
          scrollPaddingInline: LETTER_INSET,
        }}
      >
        {panels.map((panel, i) => (
          <article key={i} className="letterpanel" aria-label={`${pad(i)} of ${pad(panels.length - 1)}`}>
            <div className="font-ui text-[10px] font-black tracking-[.3em] text-[rgba(245,245,245,.34)] mb-[clamp(16px,2.2vw,26px)] tabular-nums">
              {pad(i)}
            </div>

            {"emphasis" in panel && panel.emphasis ? (
              <p className="font-display font-black text-ondark text-[clamp(24px,3.2vw,44px)] leading-[1.14] tracking-[-.015em] max-w-[20ch]">
                {panel.lines[0]}
              </p>
            ) : (
              <div className="font-body text-[clamp(17px,1.55vw,21px)] leading-[1.62] text-[rgba(245,245,245,.9)]">
                {panel.lines.map((line, k) => (
                  <span key={k} className="block">
                    {line}
                  </span>
                ))}
              </div>
            )}

            {"tail" in panel && panel.tail && (
              <p className="font-body text-[clamp(17px,1.55vw,21px)] leading-[1.62] text-[rgba(245,245,245,.9)] mt-[clamp(20px,2.6vw,30px)]">
                {panel.tail}
              </p>
            )}

            {"signoff" in panel && panel.signoff && (
              <div className="mt-auto pt-[clamp(24px,3vw,38px)]">
                <div className="font-logo font-black text-[26px] leading-none text-ondark">THT</div>
                <div className="font-ui text-[8.5px] font-black tracking-[.4em] uppercase text-[rgba(245,245,245,.52)] mt-[7px]">
                  The Human Thread_AE
                </div>
                <div className="font-ui text-[8.5px] tracking-[.24em] uppercase text-[rgba(245,245,245,.38)] mt-[6px]">
                  {panel.signoff}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
