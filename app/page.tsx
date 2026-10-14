import { site } from "@/content/site";
import {
  getCarouselFeatures,
  getCategorySections,
  getDeckEditItems,
  getEditItems,
  getFeatured,
  getLatest,
  getPosters,
} from "@/lib/content";
import type { Article, CategorySection, EditItem } from "@/lib/content";
import type { ArticleCardData } from "@/components/ArticleCard";
import StoryBand from "@/components/StoryBand";
import Carousel from "@/components/Carousel";
import EditDeck from "@/components/EditDeck";
import Marquee from "@/components/Marquee";
import CoverLetter from "@/components/CoverLetter";
import PostersGallery from "@/components/PostersGallery";

const fromArticle = (a: Article): ArticleCardData => ({
  slug: a.slug,
  category: a.category,
  name: a.name,
  role: a.role,
  title: a.title,
  deck: a.deck,
  cover: a.cover,
  coverBlur: a.coverBlur,
  latest: false,
  date: a.date,
});

const fromEdit = (e: EditItem): ArticleCardData => ({
  slug: e.slug,
  href: `/edit/${e.slug}`,
  category: e.kicker,
  name: "",
  role: "",
  title: e.title,
  deck: e.deck,
  cover: e.cover,
  coverBlur: e.coverBlur,
  latest: false,
  date: e.date,
});

export default async function Home() {
  const [featured, latest, sections, posters, features, deckItems, allEdits] = await Promise.all([
    getFeatured(),
    getLatest(10),
    getCategorySections(),
    getPosters(),
    getCarouselFeatures(),
    getDeckEditItems(),
    getEditItems(),
  ]);

  // Top Stories leads on the featured piece, then the rest of the issue by
  // date. The featured one is dropped from the run so it cannot appear twice.
  const top = [featured, ...latest.filter((a) => a.slug !== featured.slug)].slice(0, 7).map(fromArticle);

  // The landing run: the named order first, then any category with articles
  // that is not named, so adding one cannot drop it off the page silently.
  const byName = new Map(sections.map((s) => [s.name, s]));
  const named = site.landingOrder.filter((n) => n === "Gallery" || byName.has(n));
  const landing: (CategorySection | "Gallery")[] = [
    ...named.map((n) => (n === "Gallery" ? ("Gallery" as const) : byName.get(n)!)),
    ...sections.filter((s) => !(site.landingOrder as readonly string[]).includes(s.name)),
  ];

  // The reference alternates: a collage band, then a plain grid, and back.
  // Counting only the category bands keeps that rhythm even when the gallery
  // sits between two of them.
  let bandIndex = 0;

  return (
    <div className="pg relative">
      <StoryBand title="Top Stories" id="top" cards={top} collage priority />

      {landing.map((block) => {
        if (block === "Gallery") return <PostersGallery key="gallery" posters={posters} />;
        const collage = bandIndex++ % 2 === 1;
        return (
          <StoryBand
            key={block.name}
            id={block.anchor}
            title={block.name}
            href={`/catalogue?filter=${encodeURIComponent(block.name)}`}
            cards={block.articles.map(fromArticle)}
            collage={collage}
          />
        );
      })}

      <EditDeck items={deckItems} total={allEdits.length} />

      {allEdits.length > 0 && (
        <StoryBand id="cat-tht-edit" title="THT Edit" cards={allEdits.map(fromEdit)} />
      )}

      <Carousel features={features} />

      <Marquee />

      <section
        id="about"
        className="scroll-mt-[120px] max-w-[1000px] mx-auto pt-[clamp(40px,6vw,86px)] pb-[clamp(18px,2.6vw,30px)] px-[clamp(18px,4vw,40px)] text-center"
      >
        <div className="font-ui text-[11px] font-black tracking-[.32em] uppercase text-muted mb-[24px]">
          About the publication
        </div>
        <h2 className="font-display font-black text-[clamp(30px,4.6vw,62px)] leading-[1.12] tracking-[-.01em] [text-wrap:balance]">
          {site.aboutHeadline}
        </h2>
      </section>
      <section className="max-w-[680px] mx-auto pt-[clamp(16px,2.4vw,32px)] pb-[clamp(36px,4.4vw,56px)] px-[clamp(18px,4vw,40px)]">
        {site.aboutBody.map((p, i) => (
          <p key={i} className="text-[clamp(17px,1.5vw,20px)] leading-[1.72] text-ink-2 mb-[26px]">
            {p}
          </p>
        ))}
      </section>

      <section className="glossblack relative text-ondark py-[clamp(42px,5.4vw,78px)] px-[clamp(18px,4vw,54px)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="font-ui text-[11px] font-black tracking-[.28em] uppercase text-ondark mb-8">
            What we stand for
          </div>
          <div className="grid grid-cols-4 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[clamp(20px,2.4vw,40px)]">
            {site.values.map((v) => (
              <div key={v.title} className="border-t border-[rgba(255,255,255,.3)] pt-5">
                <div className="font-display font-black text-[24px] mb-[10px]">{v.title}</div>
                <p className="text-[15px] leading-[1.6] text-[rgba(255,255,255,.74)]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoverLetter />
    </div>
  );
}
