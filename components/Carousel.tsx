"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import type { CarouselSlide } from "@/lib/content";

export default function Carousel({ slides }: { slides: CarouselSlide[] }) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const SLIDES = slides;

  const set = (i: number) => {
    const n = SLIDES.length;
    setActive(((i % n) + n) % n);
  };

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % SLIDES.length);
    }, 5200);
    return () => clearInterval(t);
  }, [SLIDES.length]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      className="bg-soft border-y border-hairline py-[clamp(40px,5.5vw,84px)] overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)]">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-[clamp(28px,3.6vw,46px)]">
          <div data-reveal="left" className="max-w-[34ch]">
            <div className="font-hanken text-[10px] font-bold tracking-[.32em] uppercase text-accent mb-[14px]">
              {site.carousel.eyebrow}
            </div>
            <h2 className="font-playfair font-normal text-[clamp(32px,4.6vw,60px)] leading-[.98] tracking-[-.01em] text-ink">
              {site.carousel.title}
            </h2>
            <p className="font-playfair italic text-[clamp(16px,1.7vw,21px)] leading-[1.4] text-muted mt-3">
              {site.carousel.sub}
            </p>
          </div>
          <div className="flex items-center gap-[clamp(14px,2vw,22px)]">
            <span className="font-hanken text-[12px] tracking-[.16em] text-muted-2">
              <span className="text-ink">{pad(active + 1)}</span> / {pad(SLIDES.length)}
            </span>
            <div className="flex gap-[10px]">
              <button
                onClick={() => set(active - 1)}
                aria-label="Previous"
                className="carbtn w-[46px] h-[46px] rounded-full border-none bg-hairline text-ink font-hanken text-[16px] cursor-pointer flex items-center justify-center"
              >
                ←
              </button>
              <button
                onClick={() => set(active + 1)}
                aria-label="Next"
                className="carbtn w-[46px] h-[46px] rounded-full border-none bg-hairline text-ink font-hanken text-[16px] cursor-pointer flex items-center justify-center"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-[clamp(400px,52vw,640px)] max-[780px]:h-[clamp(340px,74vw,520px)] max-[480px]:h-[clamp(300px,86vw,460px)]">
        {SLIDES.map((s, i) => {
          let off = i - active;
          const n = SLIDES.length;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const a = Math.abs(off);
          const scale = a === 0 ? 1 : a === 1 ? 0.84 : 0.7;
          const opacity = a === 0 ? 1 : a === 1 ? 0.55 : a === 2 ? 0.24 : 0;
          const shift = off * 64;
          const blur = a === 0 ? 0 : 1.2;
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
                transition: "transform .7s cubic-bezier(.22,.61,.36,1), opacity .7s ease, filter .7s ease",
                boxShadow:
                  a === 0
                    ? "0 30px 70px -24px rgba(28,26,23,.42), 0 8px 22px -12px rgba(28,26,23,.22)"
                    : "0 16px 40px -22px rgba(28,26,23,.3)",
                background: "#fff",
              }}
            >
              <Image
                src={s.src}
                alt={s.label}
                fill
                draggable={false}
                sizes="(max-width: 780px) 74vw, 500px"
                placeholder="blur"
                blurDataURL={s.blur}
                className="object-cover select-none"
              />
            </div>
          );
        })}
      </div>

      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)]">
        <div className="flex flex-col items-center gap-[clamp(16px,2vw,22px)] mt-[clamp(26px,3.4vw,42px)]">
          <div className="font-playfair italic text-[clamp(17px,1.8vw,22px)] text-ink tracking-[.01em] text-center min-h-[1.4em]">
            {SLIDES[active].label}
          </div>
          <div className="flex items-center gap-[9px]">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                onClick={() => set(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === active ? 26 : 7,
                  height: 7,
                  borderRadius: 20,
                  background: i === active ? "var(--accent)" : "#c9c3b6",
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
    </section>
  );
}
