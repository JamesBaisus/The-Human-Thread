import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getArticle, getArticles, getRelated } from "@/lib/content";
import SimpleAmp from "@/components/SimpleAmp";

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return { title: `${article.title} — The Human Thread`, description: article.deck };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const sidebar = (await getArticles()).filter((a) => a.slug !== article.slug).slice(0, 4);
  const related = await getRelated(article.slug);

  // running figure numbers across the whole article ("No. 01", "No. 02", …),
  // plus a resolved layout per figure block: an explicit `|hint` in the MDX wins,
  // otherwise layouts rotate, seeded by the slug so each article opens differently.
  const SOLO_LAYOUTS = ["wide", "right", "inset", "left"] as const;
  const seed = [...article.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  let figCount = 0;
  let soloCount = 0;
  let pairCount = 0;
  const sections = article.sections.map((sec) => {
    const figStart = figCount;
    figCount += sec.images.length;
    let soloLayout: (typeof SOLO_LAYOUTS)[number] | null = null;
    let flip = false;
    if (sec.images.length === 1) {
      const hint = sec.images[0].layout;
      soloLayout = hint && hint !== "flip" ? hint : SOLO_LAYOUTS[(seed + soloCount) % SOLO_LAYOUTS.length];
      soloCount++;
    } else if (sec.images.length > 1) {
      flip = sec.images.some((im) => im.layout === "flip") || (seed + pairCount) % 2 === 1;
      pairCount++;
    }
    return { ...sec, figStart, soloLayout, flip };
  });
  const figNo = (n: number) => String(n + 1).padStart(2, "0");
  const soloClass = {
    wide: "min-[900px]:-mx-[7%]",
    right: "min-[700px]:w-[66%] min-[700px]:ml-auto",
    left: "min-[700px]:w-[66%] min-[700px]:mr-auto",
    inset: "min-[700px]:max-w-[78%] mx-auto",
  } as const;

  return (
    <div className="pg relative">
      <section className="max-w-[1280px] mx-auto pt-[clamp(20px,3vw,36px)] px-[clamp(18px,4vw,54px)]">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-hairline pb-[clamp(14px,1.8vw,20px)]">
          <Link
            href="/catalogue"
            className="navlink cursor-pointer font-hanken text-[11px] tracking-[.2em] uppercase text-muted"
          >
            ← All articles
          </Link>
          <div className="font-hanken text-[10.5px] font-semibold tracking-[.22em] uppercase text-ink">
            {article.category} · The Human Thread
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto pt-[clamp(26px,4vw,50px)] pb-[clamp(40px,6vw,80px)] px-[clamp(18px,4vw,54px)]">
        <div className="grid grid-cols-[1fr_320px] max-[780px]:grid-cols-1 gap-[clamp(34px,5vw,72px)] items-start">
          <article>
            <h1
              data-reveal=""
              className="font-playfair font-normal text-[clamp(34px,4.4vw,58px)] leading-[1.02] tracking-[-.01em] mb-[clamp(22px,3vw,34px)] [text-wrap:balance]"
            >
              <SimpleAmp text={article.title} />
            </h1>
            <div data-reveal="scale" className="relative overflow-hidden bg-ph">
              <Image
                src={article.cover}
                alt={article.name}
                width={article.coverWidth}
                height={article.coverHeight}
                priority
                sizes="(max-width: 780px) 100vw, 860px"
                placeholder="blur"
                blurDataURL={article.coverBlur}
                className="block w-full h-auto"
              />
            </div>
            <p
              data-reveal=""
              className="font-news italic text-[13.5px] leading-[1.5] mt-[14px] mb-[clamp(22px,3vw,32px)] max-w-[60ch] text-ink"
            >
              <SimpleAmp text={article.deck} />
            </p>

            <div className="mt-[clamp(26px,4vw,44px)]">
              {sections.map((sec, i) => (
                <section key={i} data-reveal="rise" className="py-[clamp(14px,2.4vw,26px)]">
                  {sec.heading && (
                    <h3
                      className="font-hanken font-bold text-[clamp(11px,1vw,13px)] tracking-[.18em] uppercase text-ink mb-4 pt-[clamp(14px,2vw,20px)] inline-block border-t-2"
                      style={{ borderTopColor: article.accent }}
                    >
                      {sec.heading}
                    </h3>
                  )}
                  {sec.paragraphs.map((para, k) => (
                    <p key={k} className="text-[clamp(17px,1.4vw,19.5px)] leading-[1.76] text-ink-2 mb-[22px] [text-wrap:pretty]">
                      {para}
                    </p>
                  ))}
                  {sec.images.length === 1 && sec.soloLayout && (
                    <figure data-reveal="scale" className={`my-[clamp(28px,5vw,56px)] ${soloClass[sec.soloLayout]}`}>
                      <div className="overflow-hidden rounded-[2px] bg-ph">
                        <Image
                          src={sec.images[0].src}
                          alt={sec.images[0].caption || article.name}
                          width={sec.images[0].width}
                          height={sec.images[0].height}
                          placeholder="blur"
                          blurDataURL={sec.images[0].blur}
                          sizes="(max-width: 780px) 100vw, 980px"
                          className="block w-full h-auto"
                        />
                      </div>
                      <figcaption className="flex items-center gap-4 mt-[14px]">
                        <span className="font-hanken text-[9px] font-bold tracking-[.26em] uppercase whitespace-nowrap text-ink">
                          No. {figNo(sec.figStart)}
                        </span>
                        <span className="flex-1 h-px bg-hairline" />
                        <span className="font-playfair italic text-[13.5px] leading-[1.5] text-muted text-right max-w-[46ch]">
                          <SimpleAmp text={sec.images[0].caption} />
                        </span>
                      </figcaption>
                    </figure>
                  )}
                  {sec.images.length > 1 && (
                    <div
                      className={`my-[clamp(28px,5vw,56px)] grid ${
                        sec.flip ? "grid-cols-[5fr_7fr]" : "grid-cols-[7fr_5fr]"
                      } max-[620px]:grid-cols-1 gap-[clamp(16px,2.6vw,32px)] items-start`}
                    >
                      {sec.images.map((im, k) => {
                        const offset = sec.flip ? k % 2 === 0 : k % 2 === 1;
                        return (
                        <figure
                          key={im.src}
                          data-reveal="scale"
                          data-reveal-delay={offset ? "140" : undefined}
                          className={offset ? "min-[621px]:mt-[clamp(36px,9vw,110px)]" : ""}
                        >
                          <div className="overflow-hidden rounded-[2px] bg-ph">
                            <Image
                              src={im.src}
                              alt={im.caption || article.name}
                              width={im.width}
                              height={im.height}
                              placeholder="blur"
                              blurDataURL={im.blur}
                              sizes="(max-width: 620px) 100vw, (max-width: 780px) 58vw, 500px"
                              className="block w-full h-auto"
                            />
                          </div>
                          <figcaption className="mt-3">
                            <div className="flex items-center gap-3 mb-[6px]">
                              <span className="font-hanken text-[9px] font-bold tracking-[.26em] uppercase whitespace-nowrap text-ink">
                                No. {figNo(sec.figStart + k)}
                              </span>
                              <span className="flex-1 h-px bg-hairline" />
                            </div>
                            <span className="font-playfair italic text-[13px] leading-[1.5] text-muted">
                              <SimpleAmp text={im.caption} />
                            </span>
                          </figcaption>
                        </figure>
                        );
                      })}
                    </div>
                  )}
                  {sec.pullQuote && (
                    <blockquote
                      className="mt-[clamp(20px,3vw,34px)] mb-[6px] pl-[26px] border-l-2"
                      style={{ borderLeftColor: article.accent }}
                    >
                      <span className="font-playfair italic text-[clamp(24px,3vw,38px)] leading-[1.16] text-ink">
                        <SimpleAmp text={sec.pullQuote} />
                      </span>
                    </blockquote>
                  )}
                </section>
              ))}
            </div>

            <div
              data-reveal=""
              className="mt-[clamp(12px,2vw,22px)] pt-[22px] border-t border-hairline font-hanken text-[11px] tracking-[.24em] uppercase text-muted-2"
            >
              End of feature · The Human Thread — AE
            </div>

            <div className="mt-[clamp(34px,5vw,60px)]">
              <div className="font-hanken text-[11px] font-semibold tracking-[.28em] uppercase text-muted mb-1">
                More from the issue
              </div>
              {related.map((r) => (
                <Link
                  key={r.article.slug}
                  href={`/article/${r.article.slug}`}
                  className="rellink flex items-center gap-[clamp(16px,3vw,28px)] py-[clamp(18px,2.6vw,26px)] border-t border-hairline cursor-pointer"
                >
                  <div className="flex-none font-playfair italic text-[clamp(20px,2.4vw,30px)] text-ink min-w-[2.2ch] leading-none">
                    {r.no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-hanken text-[9px] tracking-[.22em] uppercase text-muted-2 mb-[5px]">
                      {r.article.category}
                    </div>
                    <div className="font-playfair font-medium text-[clamp(20px,2.4vw,29px)] leading-[1.1] text-ink">
                      <SimpleAmp text={r.article.title} />
                    </div>
                  </div>
                  <div className="relarrow flex-none font-hanken text-[16px] text-ink">→</div>
                </Link>
              ))}
            </div>
          </article>

          <aside className="sticky top-[132px] max-[780px]:static">
            <div className="mb-[30px]">
              <h4 className="font-playfair font-medium text-[24px] mb-[14px] text-ink">Follow Us</h4>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Human Thread on Instagram"
                className="cursor-pointer flex items-center justify-center h-[62px] bg-soft rounded-[2px] text-body-2"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
            <h4 className="font-playfair font-medium text-[24px] mb-4 text-ink">The Latest</h4>
            {sidebar.map((a) => (
              <Link
                key={a.slug}
                href={`/article/${a.slug}`}
                className="latestrow flex gap-[14px] items-start p-3 rounded-[2px] cursor-pointer mb-3"
              >
                <div className="thumb flex-none w-[72px] h-[72px] overflow-hidden rounded-[2px] bg-ph relative">
                  <Image
                    src={a.cover}
                    alt=""
                    fill
                    sizes="72px"
                    placeholder="blur"
                    blurDataURL={a.coverBlur}
                    className="media object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <span className="inline-block font-hanken text-[8.5px] font-bold tracking-[.16em] uppercase text-body-2 bg-fillc rounded-[2px] py-1 px-2">
                    {a.category}
                  </span>
                  <h3 className="font-playfair font-medium text-[19px] leading-[1.14] mt-2 mb-[3px] text-ink">
                    <SimpleAmp text={a.title} />
                  </h3>
                  <p className="font-news text-[12.5px] leading-[1.4] text-muted">
                    <SimpleAmp text={a.role} />
                  </p>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </section>
    </div>
  );
}
