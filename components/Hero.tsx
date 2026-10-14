import Link from "next/link";
import Image from "next/image";
import SimpleAmp from "@/components/SimpleAmp";
import type { Article } from "@/lib/content";

const longDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * The front page: one story given the full height of the block with its
 * headline set over the image, and the rest of the issue beside it in a
 * column of cards. The arrangement a magazine front uses to say what matters
 * most today without making everything else look like a footnote.
 */
export default function Hero({ featured, latest }: { featured: Article; latest: Article[] }) {
  const beside = latest.slice(0, 4);

  return (
    <section
      id="top"
      className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(22px,3vw,40px)] pb-[clamp(30px,4vw,52px)]"
    >
      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-[clamp(22px,3vw,44px)] items-start">
        <Link
          href={`/article/${featured.slug}`}
          data-reveal="scale"
          className="herolead relative block overflow-hidden bg-ph"
        >
          <Image
            src={featured.cover}
            alt={featured.name}
            width={featured.coverWidth}
            height={featured.coverHeight}
            priority
            sizes="(max-width: 900px) 100vw, 720px"
            placeholder="blur"
            blurDataURL={featured.coverBlur}
            className="media block w-full h-full object-cover"
          />
          <span className="herolead-wash" />
          <span className="absolute left-0 bottom-0 w-full p-[clamp(18px,2.6vw,38px)] block">
            <span className="block font-ui text-[10px] font-black tracking-[.26em] uppercase text-ondark mb-[10px]">
              {featured.category}
            </span>
            <span className="block font-display font-black text-ondark text-[clamp(26px,3.4vw,48px)] leading-[1.06] [text-wrap:balance] max-w-[18ch]">
              <SimpleAmp text={featured.title} />
            </span>
            <span className="block font-ui text-[10.5px] tracking-[.14em] uppercase text-[rgba(250,246,240,.78)] mt-[14px]">
              {featured.name} · {longDate(featured.date)}
            </span>
          </span>
        </Link>

        <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-x-[clamp(16px,2vw,26px)] gap-y-[clamp(22px,2.6vw,32px)]">
          {beside.map((a) => (
            <Link key={a.slug} href={`/article/${a.slug}`} className="card cursor-pointer block">
              <span className="block relative aspect-[4/3] overflow-hidden bg-ph">
                <Image
                  src={a.cover}
                  alt=""
                  fill
                  sizes="(max-width: 620px) 100vw, 260px"
                  placeholder="blur"
                  blurDataURL={a.coverBlur}
                  className="media object-cover object-top"
                />
              </span>
              <span className="block font-ui text-[9px] font-black tracking-[.2em] uppercase text-accent mt-[12px] mb-[7px]">
                {a.category}
              </span>
              <h3 className="font-display font-black text-[clamp(17px,1.5vw,21px)] leading-[1.18] text-headline">
                <SimpleAmp text={a.title} />
              </h3>
              <span className="block font-ui text-[10px] tracking-[.12em] uppercase text-muted-2 mt-[8px]">
                {longDate(a.date)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
