"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { site } from "@/content/site";
import SimpleAmp from "@/components/SimpleAmp";
import type { Poster } from "@/lib/content";

export default function PostersGallery({ posters }: { posters: Poster[] }) {
  const [viewer, setViewer] = useState(-1);
  const [slide, setSlide] = useState(0);

  const open = (i: number) => {
    setViewer(i);
    setSlide(0);
  };
  const close = useCallback(() => setViewer(-1), []);

  const step = useCallback(
    (d: number) => {
      if (viewer < 0) return;
      const count = posters[viewer].images.length;
      setSlide((s) => ((s + d) % count + count) % count);
    },
    [viewer, posters]
  );

  useEffect(() => {
    if (viewer < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewer, close, step]);

  const cur = viewer >= 0 ? posters[viewer] : null;
  const multi = cur ? cur.images.length > 1 : false;

  return (
    <>
      <section id="posters" className="scroll-mt-20 max-w-[1360px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(44px,6vw,88px)] pb-[clamp(20px,3vw,34px)]">
        <div className="flex items-end justify-between gap-6 flex-wrap border-b border-hairline pb-[clamp(16px,2vw,26px)]">
          <div data-reveal="left">
            <div className="font-hanken text-[11px] font-semibold tracking-[.3em] uppercase text-muted mb-4">
              The cover gallery
            </div>
            <h2 className="font-playfair font-normal text-[clamp(40px,7vw,92px)] leading-[.9] tracking-[-.015em]">
              Posters
            </h2>
          </div>
          <p className="max-w-[34ch] text-[16px] leading-[1.6] text-body-1">
            Every cover of the issue, printed as a poster. Choose one to read the story behind it.
          </p>
        </div>
      </section>
      <section className="max-w-[1360px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(26px,4vw,44px)] pb-[clamp(30px,4vw,52px)]">
        <div className="iggrid">
          {posters.map((p, i) => (
            <a key={p.slug} className="gcard" onClick={() => open(i)}>
              <div className="relative overflow-hidden bg-ph" style={{ aspectRatio: p.aspectRatio }}>
                <Image
                  src={p.images[0]}
                  alt={p.title}
                  fill
                  sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw"
                  placeholder="blur"
                  blurDataURL={p.blurs[0]}
                  className="media object-cover object-top"
                />
              </div>
              <div className="gover">
                <div>
                  <span className="inline-block font-hanken text-[8.5px] font-bold tracking-[.16em] uppercase text-ink bg-[rgba(255,255,255,.9)] rounded-[2px] py-1 px-2">
                    {p.category}
                  </span>
                  <div className="font-playfair font-medium text-[21px] leading-[1.08] text-white mt-[10px]">
                    {p.title}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Portal to <body>: the .pg page wrapper has a filled transform animation,
          which would otherwise become the containing block for this fixed overlay. */}
      {cur &&
        createPortal(
        <div
          className="ov fixed inset-0 z-[200] bg-[rgba(12,10,9,.84)] backdrop-blur-[3px] flex items-center justify-center p-[clamp(10px,3vw,44px)]"
          onClick={close}
        >
          <div
            className="modcard igviewer w-full max-w-[1120px] max-h-[90vh] grid grid-cols-[1fr_372px] bg-black rounded-[3px] overflow-hidden shadow-[0_50px_120px_-30px_rgba(0,0,0,.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="igstage relative bg-[#0d0d0d] flex items-center justify-center min-h-[320px] h-[min(84vh,760px)]">
              <Image
                key={cur.images[slide]}
                src={cur.images[slide]}
                alt={cur.title}
                fill
                sizes="(max-width: 760px) 100vw, 748px"
                placeholder="blur"
                blurDataURL={cur.blurs[slide]}
                className="object-contain"
              />
              {multi && (
                <>
                  <button onClick={() => step(-1)} aria-label="Previous" className="igarrow left-[14px]">
                    ‹
                  </button>
                  <button onClick={() => step(1)} aria-label="Next" className="igarrow right-[14px]">
                    ›
                  </button>
                  <div className="absolute top-[14px] right-[14px] z-[2] font-hanken text-[10px] font-semibold tracking-[.08em] text-white bg-[rgba(0,0,0,.55)] rounded-[20px] py-[5px] px-[11px]">
                    {slide + 1} / {cur.images.length}
                  </div>
                </>
              )}
            </div>
            <div className="igpanel bg-[#141414] text-[#ededed] flex flex-col max-h-[90vh]">
              <div className="flex items-center gap-3 py-4 px-[18px] border-b border-[rgba(255,255,255,.1)]">
                <div className="flex-none w-[38px] h-[38px] rounded-full bg-ink flex items-center justify-center font-playfair font-black text-[14px] text-white">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-hanken text-[12.5px] font-bold text-white hover:underline"
                  >
                    {cur.handle}
                  </a>
                  <div className="font-hanken text-[10px] tracking-[.1em] uppercase text-[#9a9a9a]">{cur.category}</div>
                </div>
                <button onClick={close} aria-label="Close" className="modclose cursor-pointer text-[#c2c2c2] leading-none p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-5 px-[18px]">
                <div className="font-playfair font-medium text-[24px] leading-[1.08] text-white mb-4">{cur.title}</div>
                {cur.captions.map((cp, k) => (
                  <p key={k} className="font-news text-[14px] leading-[1.62] text-[#d6d6d6] mb-[14px]">
                    {cp}
                  </p>
                ))}
                <p className="font-hanken text-[13.5px] text-[#7fb0e6] mt-[2px] mb-4">{cur.hashtags}</p>
                <p className="font-news italic text-[14px] text-[#cfcfcf]">
                  <SimpleAmp text={cur.note} />
                </p>
              </div>
              <div className="border-t border-[rgba(255,255,255,.1)] py-[14px] px-[18px]">
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer inline-flex items-center gap-2 font-hanken text-[11px] font-semibold tracking-[.16em] uppercase text-white hover:opacity-70 transition-opacity"
                >
                  The Human Thread_AE ↗
                </a>
              </div>
            </div>
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
