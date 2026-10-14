import Link from "next/link";
import Image from "next/image";
import SimpleAmp from "@/components/SimpleAmp";

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
  /** ISO date, printed under the headline. */
  date?: string;
};

const longDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * A card as a magazine sets one: the section in small caps, the headline in
 * the display serif, and the attribution quiet underneath. No chips — the
 * label does that work without boxing it.
 */
export default function ArticleCard({ card, large = false }: { card: ArticleCardData; large?: boolean }) {
  return (
    <Link href={card.href ?? `/article/${card.slug}`} data-reveal="scale" className="card cursor-pointer block">
      <div className="relative aspect-[4/5] overflow-hidden bg-ph">
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

      <div className="flex items-center gap-[9px] mt-[14px] mb-[8px]">
        <span className="font-ui text-[9px] font-black tracking-[.2em] uppercase text-accent">
          {card.category}
        </span>
        {card.latest && (
          <>
            <span className="w-[3px] h-[3px] rounded-full bg-muted-2" />
            <span className="font-ui text-[9px] font-black tracking-[.2em] uppercase text-muted">Latest</span>
          </>
        )}
      </div>

      <h3
        className={`font-display font-black ${
          large ? "text-[clamp(23px,2.4vw,30px)] leading-[1.1]" : "text-[clamp(19px,1.9vw,24px)] leading-[1.14]"
        } mb-[9px] text-headline`}
      >
        <SimpleAmp text={card.title} />
      </h3>

      {card.name && (
        <p className="font-ui text-[10px] font-semibold tracking-[.14em] uppercase text-muted mb-[6px]">
          {card.name}
        </p>
      )}
      {card.date && (
        <p className="font-ui text-[10px] tracking-[.12em] uppercase text-muted-2">{longDate(card.date)}</p>
      )}
    </Link>
  );
}
