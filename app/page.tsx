import Link from "next/link";
import { site } from "@/content/site";
import { getArticle, getCarouselSlides, getCategorySections, getFeatured, getLatest, getPosters } from "@/lib/content";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import Marquee from "@/components/Marquee";
import PostersGallery from "@/components/PostersGallery";
import ArticleCard from "@/components/ArticleCard";

export default async function Home() {
  const [featured, latest, sections, posters, slides] = await Promise.all([
    getFeatured(),
    getLatest(5),
    getCategorySections(),
    getPosters(),
    getCarouselSlides(),
  ]);
  const coverBand = (await getArticle(site.coverBand.slug)) ?? featured;

  return (
    <div className="pg relative">
      <Hero featured={featured} latest={latest} />

      <Carousel slides={slides} />

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
              <h2 className="font-playfair font-normal text-[clamp(30px,4vw,54px)] leading-none">{s.name}</h2>
              <span className="font-hanken text-[11px] tracking-[.14em] text-muted-2">
                {s.articles.length === 1 ? "1 story" : `${s.articles.length} stories`}
              </span>
            </div>
            <Link
              href={`/catalogue?filter=${encodeURIComponent(s.name)}`}
              className="viewall cursor-pointer inline-flex items-center gap-2 font-hanken text-[10px] font-semibold tracking-[.2em] uppercase text-muted"
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

      <section
        id="about"
        className="scroll-mt-20 max-w-[1000px] mx-auto pt-[clamp(48px,8vw,110px)] pb-[clamp(20px,3vw,34px)] px-[clamp(18px,4vw,40px)] text-center"
      >
        <div data-reveal="" className="font-hanken text-[11px] font-semibold tracking-[.32em] uppercase text-muted mb-[26px]">
          About the publication
        </div>
        <h2
          data-reveal=""
          data-reveal-delay="80"
          className="font-playfair font-normal text-[clamp(34px,5.2vw,70px)] leading-[1.12] tracking-[-.01em] [text-wrap:balance]"
        >
          A magazine for what is <em className="font-medium">seen</em>, and what deserves to be{" "}
          <em className="font-medium">understood</em>.
        </h2>
      </section>
      <section className="max-w-[680px] mx-auto pt-[clamp(18px,3vw,38px)] pb-[clamp(40px,5vw,60px)] px-[clamp(18px,4vw,40px)]">
        {site.aboutBody.map((p, i) => (
          <p key={i} data-reveal="" className="text-[clamp(17px,1.5vw,20px)] leading-[1.72] text-ink-2 mb-[26px]">
            {p}
          </p>
        ))}
      </section>
      <section className="bg-ink text-ondark py-[clamp(46px,6vw,84px)] px-[clamp(18px,4vw,54px)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="font-hanken text-[11px] font-semibold tracking-[.28em] uppercase text-ondark mb-8">
            What we stand for
          </div>
          <div className="grid grid-cols-4 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[clamp(20px,2.4vw,40px)]">
            {site.values.map((v) => (
              <div key={v.title} data-reveal="" className="border-t border-[rgba(245,245,245,.28)] pt-5">
                <div className="font-playfair font-semibold text-[24px] mb-[10px]">{v.title}</div>
                <p className="text-[15px] leading-[1.6] text-[rgba(245,245,245,.72)]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Link
        href={`/article/${coverBand.slug}`}
        className="darkband block cursor-pointer relative py-[clamp(50px,8vw,110px)] px-[clamp(18px,4vw,54px)] bg-ink text-ondark overflow-hidden mt-[clamp(20px,3vw,36px)]"
      >
        <div className="relative max-w-[1280px] mx-auto">
          <div data-reveal="" className="font-hanken text-[11px] font-semibold tracking-[.32em] uppercase text-ondark mb-5">
            {site.coverBand.kicker} · {coverBand.category}
          </div>
          <h2
            data-reveal=""
            data-reveal-delay="90"
            className="font-playfair font-normal text-[clamp(38px,6vw,88px)] leading-none tracking-[-.01em] max-w-[16ch]"
          >
            {coverBand.title}
          </h2>
          <p
            data-reveal=""
            data-reveal-delay="160"
            className="font-playfair italic text-[clamp(18px,2vw,24px)] leading-[1.4] text-[rgba(245,245,245,.66)] mt-[22px] max-w-[44ch]"
          >
            {coverBand.deck}
          </p>
          <div
            data-reveal=""
            data-reveal-delay="230"
            className="bandbtn viewall inline-flex items-center gap-3 mt-8 text-ondark font-hanken text-[11px] font-semibold tracking-[.22em] uppercase py-[13px] px-[22px] rounded-[2px]"
          >
            Read the feature <span className="arr">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
