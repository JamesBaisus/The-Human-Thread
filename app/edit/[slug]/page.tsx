import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getEditItem, getEditItems, getOtherEditItems } from "@/lib/content";
import SimpleAmp from "@/components/SimpleAmp";
import EditFigures from "@/components/EditFigures";

export async function generateStaticParams() {
  return (await getEditItems()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEditItem(slug);
  if (!item) return {};
  return { title: `${item.title} · THT Edit`, description: item.deck };
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getEditItem(slug);
  if (!item) notFound();
  const others = await getOtherEditItems(item.slug);

  return (
    <div className="pg relative">
      <section className="max-w-[820px] mx-auto pt-[clamp(20px,3vw,36px)] px-[clamp(18px,5vw,40px)]">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-hairline pb-[clamp(14px,1.8vw,20px)]">
          <Link
            href="/#tht-edit"
            className="navlink cursor-pointer font-hanken text-[11px] tracking-[.2em] uppercase text-muted"
          >
            ← THT Edit
          </Link>
          <div className="font-hanken text-[10.5px] font-semibold tracking-[.22em] uppercase text-ink">
            {item.kicker} · The Human Thread
          </div>
        </div>
      </section>

      <article className="max-w-[820px] mx-auto pt-[clamp(26px,4vw,46px)] pb-[clamp(40px,6vw,80px)] px-[clamp(18px,5vw,40px)]">
        <div
          data-reveal=""
          className="flex items-center gap-3 font-hanken text-[10px] font-bold tracking-[.24em] uppercase mb-[14px]"
          style={{ color: item.accent }}
        >
          <span>{item.rank} of Spades</span>
          <span className="w-8 h-px" style={{ background: item.accent }} />
          <span className="text-muted-2">{item.readTime}</span>
        </div>

        <h1
          data-reveal=""
          className="font-playfair font-normal text-[clamp(32px,4.2vw,52px)] leading-[1.04] tracking-[-.01em] mb-[clamp(18px,2.6vw,28px)] [text-wrap:balance]"
        >
          <SimpleAmp text={item.title} />
        </h1>

        <div data-reveal="scale" className="relative overflow-hidden bg-ph rounded-[2px]">
          <Image
            src={item.cover}
            alt={item.title}
            width={item.coverWidth}
            height={item.coverHeight}
            priority
            sizes="(max-width: 820px) 100vw, 740px"
            placeholder="blur"
            blurDataURL={item.coverBlur}
            className="block w-full h-auto"
          />
        </div>

        <p
          data-reveal=""
          className="font-news italic text-[13.5px] leading-[1.5] mt-[14px] mb-[clamp(24px,3.4vw,38px)] max-w-[58ch] text-ink"
        >
          <SimpleAmp text={item.deck} />
        </p>

        <EditFigures sections={item.sections} accent={item.accent} title={item.title} />

        <div
          data-reveal=""
          className="mt-[clamp(18px,3vw,30px)] pt-[20px] border-t border-hairline font-hanken text-[11px] tracking-[.24em] uppercase text-muted-2"
        >
          THT Edit · The Human Thread AE
        </div>

        {others.length > 0 && (
          <div className="mt-[clamp(30px,4.5vw,54px)]">
            <div className="font-hanken text-[11px] font-semibold tracking-[.28em] uppercase text-muted mb-1">
              More from the Edit
            </div>
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/edit/${o.slug}`}
                className="rellink flex items-center gap-[clamp(14px,2.6vw,24px)] py-[clamp(16px,2.4vw,24px)] border-t border-hairline cursor-pointer"
              >
                <div className="flex-none font-playfair italic text-[clamp(19px,2.2vw,27px)] text-ink min-w-[2ch] leading-none">
                  {o.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-hanken text-[9px] tracking-[.22em] uppercase text-muted-2 mb-[5px]">
                    {o.kicker}
                  </div>
                  <div className="font-playfair font-medium text-[clamp(18px,2.2vw,26px)] leading-[1.12] text-ink">
                    <SimpleAmp text={o.title} />
                  </div>
                </div>
                <div className="relarrow flex-none font-hanken text-[16px] text-ink">→</div>
              </Link>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
