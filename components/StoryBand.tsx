import Link from "next/link";
import ArticleCard, { type ArticleCardData } from "@/components/ArticleCard";
import OverlayStory from "@/components/OverlayStory";
import FiftyFifty from "@/components/FiftyFifty";

/**
 * A section of the front page, built the way the reference builds one.
 *
 * The band opens on its name in the display serif over a rule. A `collage`
 * band then leads with one story given the full height of the block and three
 * asides listed beside it; a plain band goes straight to the grid. Either way
 * the rest of the section follows as a row of cards.
 */
export default function StoryBand({
  title,
  id,
  href,
  cards,
  collage = false,
  priority = false,
}: {
  title: string;
  id?: string;
  href?: string;
  cards: ArticleCardData[];
  collage?: boolean;
  priority?: boolean;
}) {
  if (cards.length === 0) return null;

  // A collage needs a lead and at least one aside to be worth the layout;
  // below that the band is better off as a plain grid.
  const asCollage = collage && cards.length >= 3;
  const lead = asCollage ? cards[0] : null;
  const asides = asCollage ? cards.slice(1, 4) : [];
  const grid = asCollage ? cards.slice(4) : cards;

  return (
    <section id={id} className="band scroll-mt-[120px] max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] py-[clamp(26px,3.4vw,46px)]">
      <div className="flex items-end justify-between gap-5 border-b-2 border-ink pb-[clamp(10px,1.2vw,14px)] mb-[clamp(18px,2.2vw,30px)]">
        <h2 className="bandhed font-display font-black text-[clamp(22px,2.6vw,34px)] leading-none tracking-[-.01em]">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="viewall shrink-0 cursor-pointer inline-flex items-center gap-2 font-ui text-[10px] font-black tracking-[.2em] uppercase text-muted"
          >
            See more <span className="arr">→</span>
          </Link>
        )}
      </div>

      {asCollage && lead && (
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-[clamp(20px,2.6vw,38px)] mb-[clamp(22px,2.8vw,40px)] items-stretch">
          <OverlayStory card={lead} priority={priority} />
          <div className="flex flex-col">
            {asides.map((c) => (
              <FiftyFifty key={c.href ?? c.slug} card={c} />
            ))}
          </div>
        </div>
      )}

      {grid.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-x-[clamp(16px,1.8vw,26px)] gap-y-[clamp(24px,2.6vw,38px)]">
          {grid.map((c) => (
            <ArticleCard key={c.href ?? c.slug} card={c} />
          ))}
        </div>
      )}
    </section>
  );
}
