import Link from "next/link";
import Image from "next/image";
import SimpleAmp from "@/components/SimpleAmp";
import { longDate } from "@/lib/date";

export type ArticleCardData = {
  slug: string;
  category: string;
  /** Byline. Left empty by THT Edit pieces, which are about a subject, not a person. */
  name: string;
  role: string;
  /** Defaults to the article reader; Edit pieces point at their own route. */
  href?: string;
  title: string;
  deck: string;
  cover: string;
  coverBlur: string;
  latest: boolean;
  /** ISO date, printed under the byline. */
  date?: string;
};

/**
 * The card the reference repeats everywhere: a square picture, the rubric in
 * small caps, the headline in the display serif, then the byline and the date.
 * Nothing is boxed and nothing is badged — the label does that work on its own.
 */
export default function ArticleCard({ card, large = false }: { card: ArticleCardData; large?: boolean }) {
  return (
    <Link href={card.href ?? `/article/${card.slug}`} className="card cursor-pointer block">
      <div className="relative aspect-square overflow-hidden bg-ph">
        <Image
          src={card.cover}
          alt={card.name || card.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          placeholder="blur"
          blurDataURL={card.coverBlur}
          className="media object-cover object-top"
        />
      </div>

      <span className="block font-ui text-[9px] font-black tracking-[.2em] uppercase text-accent mt-[13px] mb-[8px]">
        {card.category}
      </span>

      <h3
        className={`font-display font-semibold ${
          large ? "text-[clamp(21px,2.2vw,28px)] leading-[1.1]" : "text-[clamp(17px,1.7vw,22px)] leading-[1.15]"
        } text-headline`}
      >
        <SimpleAmp text={card.title} />
      </h3>

      <span className="block font-ui text-[10px] tracking-[.12em] uppercase text-muted-2 mt-[10px]">
        {card.name ? `By ${card.name}` : null}
        {card.name && card.date ? <br /> : null}
        {card.date ? longDate(card.date) : null}
      </span>
    </Link>
  );
}
