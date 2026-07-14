"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { site } from "@/content/site";
import type { CarouselSlide } from "@/lib/content";

export default function Carousel({ slides }: { slides: CarouselSlide[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const n = slides.length;

  const pad = (x: number) => String(x).padStart(2, "0");
  const set = (i: number) => setActive(((i % n) + n) % n);
  const step = useCallback((d: number) => setActive((a) => (((a + d) % n) + n) % n), [n]);

  const openAt = (i: number) => {
    setActive(i);
    setOpen(true);
  };
  const close = useCallback(() => setOpen(false), []);

  // Keyboard nav, autoplay, and body-scroll lock — only while the pop-up is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % n);
    }, 5200);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearInterval(t);
    };
  }, [open, close, step, n]);

  return (
    <section className="bg-soft border-y border-hairline py-[clamp(40px,5.5vw,84px)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)]">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-[clamp(28px,3.6vw,46px)]">
          <div data-reveal="left" className="max-w-[38ch]">
            <div className="font-hanken text-[10px] font-bold tracking-[.32em] uppercase text-ink mb-[14px]">
              {site.carousel.eyebrow}
            </div>
            <h2 className="font-playfair font-normal text-[clamp(32px,4.6vw,60px)] leading-[.98] tracking-[-.01em] text-ink">
              {site.carousel.title}
            </h2>
            <p className="font-playfair italic text-[clamp(16px,1.7vw,21px)] leading-[1.4] text-muted mt-3">
              {site.carousel.sub}
            </p>
          </div>
          <span className="font-hanken text-[11px] tracking-[.18em] uppercase text-muted-2">
            {pad(n)} {n === 1 ? "chapter" : "chapters"}
          </span>
        </div>

        {/* Catalogue of cards — the first page of each chapter is its cover. */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(196px,100%),1fr))] gap-[clamp(14px,1.8vw,26px)]">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => openAt(i)}
              aria-label={`Open ${s.label}`}
              className="cgcard group text-left cursor-pointer"
            >
              <div
                className="relative overflow-hidden bg-ph rounded-[3px] shadow-[0_18px_44px_-26px_rgba(28,26,23,.5)]"
                style={{ aspectRatio: "1236 / 1600" }}
              >
                <Image
                  src={s.src}
                  alt={s.label}
                  fill
                  sizes="(max-width: 620px) 50vw, (max-width: 1100px) 33vw, 220px"
                  placeholder="blur"
                  blurDataURL={s.blur}
                  className="media object-cover transition-transform duration-[850ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
                />
                <span className="absolute top-[10px] left-[10px] z-[2] font-hanken text-[10px] font-bold tracking-[.12em] text-white bg-[rgba(0,0,0,.42)] backdrop-blur-[2px] rounded-full py-[3px] px-[9px]">
                  {pad(i + 1)}
                </span>
                <div className="absolute inset-0 z-[1] flex items-end justify-center bg-gradient-to-t from-[rgba(12,10,9,.5)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="mb-4 inline-flex items-center gap-2 font-hanken text-[10px] font-semibold tracking-[.18em] uppercase text-white">
                    View <span aria-hidden>⤢</span>
                  </span>
                </div>
              </div>
              <div className="font-playfair italic text-[clamp(14px,1.4vw,16px)] text-ink mt-[12px] leading-[1.3] group-hover:text-[color:var(--accent)] transition-colors">
                {s.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pop-up coverflow — the same slide design, now on demand. Portalled to
          <body> so the .pg page transform doesn't become its containing block. */}
      {open &&
        createPortal(
          <div
            className="ov fixed inset-0 z-[200] bg-[rgba(12,10,9,.9)] backdrop-blur-[5px] flex flex-col items-center justify-center p-[clamp(12px,3vw,44px)]"
            onClick={close}
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-[clamp(14px,2.4vw,28px)] right-[clamp(14px,2.4vw,28px)] z-[3] cursor-pointer text-[rgba(255,255,255,.8)] hover:text-white transition-colors p-1"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>

            <div
              className="modcard w-full max-w-[1180px] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-4 mb-[clamp(16px,2.4vw,30px)] text-center">
                <span className="font-hanken text-[10px] font-bold tracking-[.32em] uppercase text-[rgba(255,255,255,.72)]">
                  {site.carousel.eyebrow}
                </span>
                <span className="font-hanken text-[11px] tracking-[.14em] text-[rgba(255,255,255,.55)]">
                  {pad(active + 1)} / {pad(n)}
                </span>
              </div>

              <div className="relative w-full h-[min(64vh,600px)] max-[780px]:h-[min(60vh,460px)]">
                {slides.map((s, i) => {
                  let off = i - active;
                  if (off > n / 2) off -= n;
                  if (off < -n / 2) off += n;
                  const a = Math.abs(off);
                  const scale = a === 0 ? 1 : a === 1 ? 0.84 : 0.7;
                  const opacity = a === 0 ? 1 : a === 1 ? 0.5 : a === 2 ? 0.22 : 0;
                  const shift = off * 64;
                  const blur = a === 0 ? 0 : 1.4;
                  return (
                    <div
                      key={s.src}
                      onClick={() => set(i)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        height: "100%",
                        aspectRatio: "1236 / 1600",
                        transform: `translateX(-50%) translateX(${shift}%) scale(${scale})`,
                        opacity,
                        zIndex: 10 - a,
                        cursor: a === 0 ? "default" : "pointer",
                        pointerEvents: a > 2 ? "none" : "auto",
                        filter: blur ? `blur(${blur}px)` : "none",
                        transition:
                          "transform .7s cubic-bezier(.22,.61,.36,1), opacity .7s ease, filter .7s ease",
                        boxShadow:
                          a === 0
                            ? "0 40px 90px -30px rgba(0,0,0,.7), 0 10px 30px -14px rgba(0,0,0,.5)"
                            : "0 20px 50px -26px rgba(0,0,0,.6)",
                        background: "#fff",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={s.src}
                        alt={s.label}
                        fill
                        draggable={false}
                        sizes="(max-width: 780px) 74vw, 460px"
                        placeholder="blur"
                        blurDataURL={s.blur}
                        className="object-cover select-none"
                      />
                    </div>
                  );
                })}

                {n > 1 && (
                  <>
                    <button onClick={() => step(-1)} aria-label="Previous" className="igarrow left-[clamp(6px,2vw,26px)]" style={{ zIndex: 20 }}>
                      ‹
                    </button>
                    <button onClick={() => step(1)} aria-label="Next" className="igarrow right-[clamp(6px,2vw,26px)]" style={{ zIndex: 20 }}>
                      ›
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-[clamp(14px,2vw,20px)] mt-[clamp(16px,2.4vw,28px)]">
                <div className="font-playfair italic text-[clamp(17px,1.8vw,23px)] text-white tracking-[.01em] text-center min-h-[1.4em]">
                  {slides[active].label}
                </div>
                <div className="flex items-center gap-[9px]">
                  {slides.map((s, i) => (
                    <button
                      key={s.src}
                      onClick={() => set(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      style={{
                        width: i === active ? 26 : 7,
                        height: 7,
                        borderRadius: 20,
                        background: i === active ? "var(--accent)" : "rgba(255,255,255,.34)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "width .4s ease, background .4s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
