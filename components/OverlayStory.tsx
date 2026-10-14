import Link from "next/link";
import Image from "next/image";
import SimpleAmp from "@/components/SimpleAmp";
import type { ArticleCardData } from "@/components/ArticleCard";
import { longDate } from "@/lib/date";

/**
 * The lead of a collage band: one picture given the height of the block with
 * the rubric, headline and byline set over it in white. The reference leans
 * on this to say which story in a section matters most, without a label.
 */
export default function OverlayStory({ card, priority = false }: { card: ArticleCardData; priority?: boolean }) {
  return (
    <Link
      href={card.href ?? `/article/${card.slug}`}
      className="ovstory relative block overflow-hidden bg-ph h-full min-h-[clamp(320px,42vw,560px)]"
    >
      <Image
        src={card.cover}
        alt={card.name || card.title}
        fill
        priority={priority}
        sizes="(max-width: 900px) 100vw, 760px"
        placeholder="blur"
        blurDataURL={card.coverBlur}
        className="media object-cover"
      />
      <span className="ovstory-wash" />
      <span className="absolute left-0 bottom-0 w-full p-[clamp(18px,2.4vw,34px)] block">
        <span className="block font-ui text-[10px] font-black tracking-[.22em] uppercase text-ondark mb-[10px]">
          {card.category}
        </span>
        <span className="block font-display font-black text-ondark text-[clamp(24px,3vw,42px)] leading-[1.08] [text-wrap:balance] max-w-[20ch]">
          <SimpleAmp text={card.title} />
        </span>
        <span className="block font-ui text-[10.5px] tracking-[.12em] uppercase text-[rgba(255,255,255,.8)] mt-[13px]">
          {card.name ? `By ${card.name}` : null}
          {card.name && card.date ? " · " : null}
          {card.date ? longDate(card.date) : null}
        </span>
      </span>
    </Link>
  );
}
