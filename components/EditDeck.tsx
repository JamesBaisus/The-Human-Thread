"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EditItem } from "@/lib/content";
import SimpleAmp from "@/components/SimpleAmp";

/**
 * The cover, printed. Each cover keeps its own proportions rather than being
 * cropped to a common frame, because they carry their headline burned in.
 */
function Cover({ item, eager }: { item: EditItem; eager?: boolean }) {
  return (
    <span className="editcover">
      <Image
        src={item.cover}
        alt=""
        width={item.coverWidth}
        height={item.coverHeight}
        sizes="(max-width: 900px) 62vw, 280px"
        placeholder="blur"
        blurDataURL={item.coverBlur}
        priority={eager}
        className="editcover-img"
      />
    </span>
  );
}

export default function EditDeck({ items, total }: { items: EditItem[]; total: number }) {
  const front = items.length - 1;
  const [active, setActive] = useState(front);
  if (items.length === 0) return null;
  const current = items[active] ?? items[0];

  // Spread like a dealt hand: every cover sits at the same point and pivots
  // about an origin below the deck, so rotation alone does the fanning.
  const spread = items.length > 5 ? 8.5 : 10;
  const angleOf = (i: number) => (i - (items.length - 1) / 2) * spread;

  return (
    <section
      id="tht-edit"
      className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(30px,5vw,64px)] pb-[clamp(34px,5vw,72px)]"
    >
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] max-[900px]:grid-cols-1 gap-[clamp(24px,4vw,56px)] items-center">
        <div data-reveal="">
          <div className="font-ui text-[11px] font-black tracking-[.28em] uppercase text-muted mb-3">
            The Edit
          </div>
          <h2 className="font-display font-black text-[clamp(32px,4.2vw,54px)] leading-[1.03] tracking-[-.02em] text-headline">
            THT Edit
          </h2>
          <p className="font-body text-[clamp(14.5px,1.2vw,16px)] leading-[1.6] text-body-1 mt-[14px] max-w-[46ch]">
            The shorter read. Fashion, culture and the moments worth stopping for.
          </p>

          {total > items.length && (
            <Link
              href="#cat-tht-edit"
              className="viewall cursor-pointer inline-flex items-center gap-2 font-ui text-[10px] font-black tracking-[.2em] uppercase text-muted mt-[clamp(16px,2.2vw,22px)]"
            >
              See all {total} <span className="arr">→</span>
            </Link>
          )}

          {/* Reads out the cover under the cursor; holds its height so nothing jumps. */}
          <div className="mt-[clamp(20px,3vw,32px)] pt-[18px] border-t border-hairline min-h-[112px] max-[900px]:hidden">
            <div
              className="font-ui text-[9.5px] font-black tracking-[.24em] uppercase mb-[7px]"
              style={{ color: current.accent }}
            >
              {String(active + 1).padStart(2, "0")} · {current.kicker}
            </div>
            <div key={current.slug} className="editcover-readout">
              <div className="font-display font-black text-[clamp(21px,2.1vw,28px)] leading-[1.14] tracking-[-.01em] text-ink">
                <SimpleAmp text={current.title} />
              </div>
              <div className="font-ui text-[10.5px] tracking-[.2em] uppercase text-muted-2 mt-[9px]">
                {current.readTime}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: the fan.

            The covers are visuals only. Overlapping rotated rectangles make
            terrible targets — a middle card exposed barely a fifth of itself,
            and nothing at all across its waist — so pointer handling lives in
            an even row of invisible columns laid over the top instead. Each
            card gets the same generous, stationary target, and the lift
            animation can move the artwork freely without stealing the cursor
            from under itself. */}
        <div
          data-reveal="scale"
          className="editfan relative h-[clamp(360px,34vw,470px)] max-[900px]:hidden"
          onMouseLeave={() => setActive(front)}
        >
          {items.map((item, i) => (
            <span
              key={item.slug}
              className={`editfan-slot${active === i ? " is-up" : ""}`}
              style={{ ["--a" as string]: `${angleOf(i)}deg`, zIndex: active === i ? 40 : 10 + i }}
              aria-hidden="true"
            >
              <Cover item={item} eager={i < 3} />
            </span>
          ))}

          <div className="editfan-hits">
            {items.map((item, i) => (
              <Link
                key={item.slug}
                href={`/edit/${item.slug}`}
                aria-label={`${item.title} — ${item.kicker}`}
                className="editfan-hit"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              />
            ))}
          </div>
        </div>

        {/* Narrow screens: the same covers, dealt into a row you can swipe. */}
        <div className="editrail hidden max-[900px]:flex">
          {items.map((item) => (
            <Link key={item.slug} href={`/edit/${item.slug}`} className="editrail-item">
              <Cover item={item} />
              <span className="block mt-[11px]">
                <span
                  className="block font-ui text-[9px] font-black tracking-[.22em] uppercase mb-[5px]"
                  style={{ color: item.accent }}
                >
                  {item.kicker}
                </span>
                <span className="block font-display font-black text-[17px] leading-[1.16] tracking-[-.01em] text-ink">
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
