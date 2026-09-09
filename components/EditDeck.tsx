"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EditItem } from "@/lib/content";
import SimpleAmp from "@/components/SimpleAmp";

function Spade({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 1.2 3.4 6.1c-1.5 1.6-1.7 3.7-.4 4.9 1.1 1 2.7.8 3.7-.3l-.5 3.6h3.6l-.5-3.6c1 1.1 2.6 1.3 3.7.3 1.3-1.2 1.1-3.3-.4-4.9z" />
    </svg>
  );
}

/**
 * One cover card. The window hugs the cover's real proportions so nothing is
 * cropped away — these covers carry their headline burned in — which leaves a
 * different amount of cream stock under each photo, the way a mounted card sits.
 */
function Card({ item, eager }: { item: EditItem; eager?: boolean }) {
  return (
    <span className="editcard">
      <span className="editcard-rank editcard-rank-tl">
        <span>{item.rank}</span>
        <Spade className="w-[9px] h-[9px]" />
      </span>
      <span className="editcard-window" style={{ aspectRatio: `${item.coverWidth} / ${item.coverHeight}` }}>
        <Image
          src={item.cover}
          alt=""
          fill
          sizes="(max-width: 900px) 62vw, 260px"
          placeholder="blur"
          blurDataURL={item.coverBlur}
          priority={eager}
          className="object-cover"
        />
      </span>
      <span className="editcard-rank editcard-rank-br">
        <span>{item.rank}</span>
        <Spade className="w-[9px] h-[9px]" />
      </span>
    </span>
  );
}

export default function EditDeck({ items }: { items: EditItem[] }) {
  const front = items.length - 1;
  const [active, setActive] = useState(front);
  if (items.length === 0) return null;
  const current = items[active] ?? items[0];

  // A held hand: every card sits at the same point and pivots about a origin
  // below the deck, so rotation alone does the fanning.
  const spread = items.length > 5 ? 8.5 : 10;
  const angleOf = (i: number) => (i - (items.length - 1) / 2) * spread;

  return (
    <section
      id="tht-edit"
      className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(30px,5vw,64px)] pb-[clamp(34px,5vw,72px)]"
    >
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] max-[900px]:grid-cols-1 gap-[clamp(24px,4vw,56px)] items-center">
        <div data-reveal="">
          <div className="font-hanken text-[11px] font-semibold tracking-[.28em] uppercase text-muted mb-3">
            The Edit
          </div>
          <h2 className="font-playfair font-normal text-[clamp(32px,4.2vw,54px)] leading-[1.03] tracking-[-.01em] text-ink">
            THT Edit
          </h2>
          <p className="font-news text-[clamp(14.5px,1.2vw,16px)] leading-[1.6] text-body-1 mt-[14px] max-w-[46ch]">
            The shorter read. Fashion, culture and the moments worth stopping for, dealt one card at a
            time.
          </p>

          {/* Reads out the card under the cursor; holds its height so nothing jumps. */}
          <div className="mt-[clamp(20px,3vw,32px)] pt-[18px] border-t border-hairline min-h-[112px] max-[900px]:hidden">
            <div
              className="font-hanken text-[9.5px] font-bold tracking-[.24em] uppercase mb-[7px]"
              style={{ color: current.accent }}
            >
              {current.rank} of Spades · {current.kicker}
            </div>
            <div key={current.slug} className="editcard-readout">
              <div className="font-playfair font-medium text-[clamp(21px,2.1vw,28px)] leading-[1.14] text-ink">
                <SimpleAmp text={current.title} />
              </div>
              <div className="font-hanken text-[10.5px] tracking-[.2em] uppercase text-muted-2 mt-[9px]">
                {current.readTime}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: the fan. */}
        <div
          data-reveal="scale"
          className="editfan relative h-[clamp(360px,34vw,470px)] max-[900px]:hidden"
          onMouseLeave={() => setActive(front)}
        >
          {items.map((item, i) => (
            <Link
              key={item.slug}
              href={`/edit/${item.slug}`}
              aria-label={`${item.title} — ${item.kicker}`}
              className="editfan-slot"
              style={{ ["--a" as string]: `${angleOf(i)}deg`, zIndex: active === i ? 40 : 10 + i }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <Card item={item} eager={i < 3} />
            </Link>
          ))}
        </div>

        {/* Narrow screens: the same cards, dealt into a row you can swipe. */}
        <div className="editrail hidden max-[900px]:flex">
          {items.map((item) => (
            <Link key={item.slug} href={`/edit/${item.slug}`} className="editrail-item">
              <Card item={item} />
              <span className="block mt-[10px]">
                <span
                  className="block font-hanken text-[9px] font-bold tracking-[.22em] uppercase mb-[5px]"
                  style={{ color: item.accent }}
                >
                  {item.kicker}
                </span>
                <span className="block font-playfair font-medium text-[17px] leading-[1.15] text-ink">
                  <SimpleAmp text={item.title} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
