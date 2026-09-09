import Link from "next/link";
import { site } from "@/content/site";
import { getCarouselFeatures, getCategorySections, getDeckEditItems, getFeatured, getLatest, getPosters, getShelfEditItems } from "@/lib/content";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import EditDeck from "@/components/EditDeck";
import Marquee from "@/components/Marquee";
import CoverLetter from "@/components/CoverLetter";
import PostersGallery from "@/components/PostersGallery";
import ArticleCard from "@/components/ArticleCard";

export default async function Home() {
  const [featured, latest, sections, posters, features, deckItems, shelfItems] = await Promise.all([
    getFeatured(),
    getLatest(5),
    getCategorySections(),
    getPosters(),
    getCarouselFeatures(),
    getDeckEditItems(),
    getShelfEditItems(),
  ]);

  return (
    <div className="pg relative">
      <Hero featured={featured} latest={latest} />

      <EditDeck items={deckItems} />

      <Carousel features={features} />

      <Marquee />

      <PostersGallery posters={posters} />

      {sections.map((s) => (
        <section
          key={s.name}
          id={s.anchor}
          className="scroll-mt-20 max-w-[1280px] mx-auto py-[clamp(30px,4vw,52px)] px-[clamp(18px,4vw,54px)]"
        >
          <div className="flex items-end justify-between gap-5 mb-[clamp(20px,2.6vw,32px)] border-b border-hairline pb-[clamp(14px,1.8vw,20px)]">
            <div data-reveal="left" className="flex items-baseline gap-4">
              <h2 className="font-display font-black text-[clamp(30px,4vw,54px)] leading-none">{s.name}</h2>
              <span className="font-ui text-[11px] tracking-[.14em] text-muted-2">
                {s.articles.length === 1 ? "1 story" : `${s.articles.length} stories`}
              </span>
            </div>
            <Link
              href={`/catalogue?filter=${encodeURIComponent(s.name)}`}
              className="viewall cursor-pointer inline-flex items-center gap-2 font-ui text-[10px] font-black tracking-[.2em] uppercase text-muted"
            >
              View all <span className="arr">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(258px,100%),1fr))] gap-[clamp(20px,2.2vw,34px)]">
            {s.articles.map((a, i) => (
              <ArticleCard
                key={a.slug}
                card={{
                  slug: a.slug,
                  category: a.category,
                  name: a.name,
                  role: a.role,
                  title: a.title,
                  deck: a.deck,
                  cover: a.cover,
                  coverBlur: a.coverBlur,
                  latest: i === 0,
                }}
              />
            ))}
          </div>
        </section>
      ))}

      {shelfItems.length > 0 && (
        <section
          id="cat-tht-edit"
          className="scroll-mt-20 max-w-[1280px] mx-auto py-[clamp(30px,4vw,52px)] px-[clamp(18px,4vw,54px)]"
        >
          <div className="flex items-end justify-between gap-5 mb-[clamp(20px,2.6vw,32px)] border-b border-hairline pb-[clamp(14px,1.8vw,20px)]">
            <div data-reveal="left" className="flex items-baseline gap-4">
              <h2 className="font-display font-black text-[clamp(30px,4vw,54px)] leading-none">THT Edit</h2>
              <span className="font-ui text-[11px] tracking-[.14em] text-muted-2">
                {shelfItems.length === 1 ? "1 piece" : `${shelfItems.length} pieces`}
              </span>
            </div>
            <Link
              href="/#tht-edit"
              className="viewall cursor-pointer inline-flex items-center gap-2 font-ui text-[10px] font-black tracking-[.2em] uppercase text-muted"
            >
              The deck <span className="arr">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(258px,100%),1fr))] gap-[clamp(20px,2.2vw,34px)]">
            {shelfItems.map((e) => (
              <ArticleCard
                key={e.slug}
                card={{
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
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section
        id="about"
        className="scroll-mt-20 max-w-[1000px] mx-auto pt-[clamp(48px,8vw,110px)] pb-[clamp(20px,3vw,34px)] px-[clamp(18px,4vw,40px)] text-center"
      >
        <div data-reveal="" className="font-ui text-[11px] font-black tracking-[.32em] uppercase text-muted mb-[26px]">
          About the publication
        </div>
        <h2
          data-reveal=""
          data-reveal-delay="80"
          className="font-display font-black text-[clamp(34px,5.2vw,70px)] leading-[1.12] tracking-[-.01em] [text-wrap:balance]"
        >
          A magazine for what is <em className="font-black">seen</em>, and what deserves to be{" "}
          <em className="font-black">understood</em>.
        </h2>
      </section>
      <section className="max-w-[680px] mx-auto pt-[clamp(18px,3vw,38px)] pb-[clamp(40px,5vw,60px)] px-[clamp(18px,4vw,40px)]">
        {site.aboutBody.map((p, i) => (
          <p key={i} data-reveal="" className="text-[clamp(17px,1.5vw,20px)] leading-[1.72] text-ink-2 mb-[26px]">
            {p}
          </p>
        ))}
      </section>
      <section className="glossblack relative text-ondark py-[clamp(46px,6vw,84px)] px-[clamp(18px,4vw,54px)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="font-ui text-[11px] font-black tracking-[.28em] uppercase text-ondark mb-8">
            What we stand for
          </div>
          <div className="grid grid-cols-4 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[clamp(20px,2.4vw,40px)]">
            {site.values.map((v) => (
              <div key={v.title} data-reveal="" className="border-t border-[rgba(245,245,245,.28)] pt-5">
                <div className="font-display font-black text-[24px] mb-[10px]">{v.title}</div>
                <p className="text-[15px] leading-[1.6] text-[rgba(245,245,245,.72)]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoverLetter />
    </div>
  );
}
