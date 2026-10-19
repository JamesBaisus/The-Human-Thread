import Link from "next/link";
import Image from "next/image";
import SimpleAmp from "@/components/SimpleAmp";
import type { ArticleCardData } from "@/components/ArticleCard";
import { longDate } from "@/lib/date";

/**
 * The aside that sits beside a collage lead: a square picture at half width
 * with the text alongside. The reference stacks three of these next to its
 * lead, and keeps them side by side at every width, so they read as a list
 * of what else is in the section rather than as more cards.
 */
export default function FiftyFifty({ card }: { card: ArticleCardData }) {
  return (
    <Link
      href={card.href ?? `/article/${card.slug}`}
      className="card fifty grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[clamp(12px,1.4vw,20px)] items-start py-[clamp(14px,1.6vw,20px)] border-b border-hairline last:border-b-0"
    >
      <span className="relative block aspect-square overflow-hidden bg-ph">
        <Image
          src={card.cover}
          alt=""
          fill
          sizes="(max-width: 900px) 42vw, 190px"
          placeholder="blur"
          blurDataURL={card.coverBlur}
          className="media object-cover object-top"
        />
      </span>
      <span className="block">
        <span className="block font-ui text-[9px] font-black tracking-[.2em] uppercase text-accent mb-[7px]">
          {card.category}
        </span>
        <h3 className="font-display font-semibold text-[clamp(15px,1.4vw,19px)] leading-[1.18] text-headline">
          <SimpleAmp text={card.title} />
        </h3>
        <span className="block font-ui text-[9.5px] tracking-[.12em] uppercase text-muted-2 mt-[9px]">
          {card.name ? `By ${card.name}` : null}
          {card.name && card.date ? <br /> : null}
          {card.date ? longDate(card.date) : null}
        </span>
      </span>
    </Link>
  );
}
