import Link from "next/link";
import Image from "next/image";

export type ArticleCardData = {
  slug: string;
  category: string;
  name: string;
  role: string;
  title: string;
  deck: string;
  cover: string;
  latest: boolean;
};

export default function ArticleCard({ card, large = false }: { card: ArticleCardData; large?: boolean }) {
  return (
    <Link href={`/article/${card.slug}`} data-reveal="scale" className="card cursor-pointer block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-ph">
        <Image
          src={card.cover}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="media object-cover object-top"
        />
      </div>
      <div className={`flex items-center gap-[10px] ${large ? "mt-4" : "mt-[15px]"} mb-[9px]`}>
        {card.latest && (
          <span className="inline-block font-hanken text-[8.5px] font-bold tracking-[.16em] uppercase text-ondark bg-ink rounded-[2px] py-1 px-2">
            Latest
          </span>
        )}
        <span className="inline-block font-hanken text-[8.5px] font-bold tracking-[.16em] uppercase text-body-2 bg-fillc rounded-[2px] py-1 px-2">
          {card.category}
        </span>
        <span className="revealline w-[22px] h-px bg-accent" />
      </div>
      <h3
        className={`font-playfair font-medium ${
          large ? "text-[clamp(23px,2.4vw,30px)] leading-[1.05]" : "text-[clamp(22px,2.3vw,28px)] leading-[1.06]"
        } mb-2 text-ink`}
      >
        {card.title}
      </h3>
      <p className="font-playfair italic text-[14px] text-accent mb-2">
        {card.name} — {card.role}
      </p>
      <p className="text-[14px] leading-[1.55] text-muted [text-wrap:pretty]">{card.deck}</p>
    </Link>
  );
}
