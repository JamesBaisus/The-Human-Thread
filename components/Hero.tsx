import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content";

export default function Hero({ featured, latest }: { featured: Article; latest: Article[] }) {
  return (
    <section id="top" className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(30px,4vw,58px)] pb-[clamp(30px,4vw,52px)]">
      <div className="grid grid-cols-[1fr_300px] max-[1080px]:grid-cols-[1fr_260px] max-[780px]:grid-cols-1 gap-[clamp(24px,3.4vw,64px)] items-start">
        <Link href={`/article/${featured.slug}`} className="herofeat cursor-pointer relative text-left block">
          <div className="flex items-center gap-3 mb-[clamp(12px,1.4vw,16px)]">
            <span className="font-hanken text-[10px] font-bold tracking-[.28em] uppercase text-accent">Featured</span>
            <span className="flex-1 h-px bg-hairline" />
          </div>
          <div data-reveal="scale" className="heroimg relative overflow-hidden w-full max-w-[330px] mx-auto bg-ph">
            <Image
              src={featured.cover}
              alt={featured.name}
              width={featured.coverWidth}
              height={featured.coverHeight}
              priority
              sizes="330px"
              className="media block w-full h-auto"
            />
          </div>
          <span className="inline-block font-hanken text-[9px] font-bold tracking-[.16em] uppercase text-body-2 bg-fillc rounded-[2px] py-[6px] px-[11px] mt-[clamp(18px,2.2vw,26px)]">
            {featured.category}
          </span>
          <h1
            data-reveal=""
            className="font-playfair font-medium text-[clamp(28px,3.1vw,42px)] leading-[1.06] tracking-[-.005em] mt-[14px] text-ink [text-wrap:balance] max-w-[14ch]"
          >
            {featured.title}
          </h1>
        </Link>

        <aside className="sticky top-[120px] max-[780px]:static flex flex-col gap-[clamp(22px,2.6vw,32px)]">
          <h4 className="font-playfair font-medium text-[24px] text-ink -mb-[6px]">The Latest</h4>
          {latest.map((a) => (
            <Link key={a.slug} href={`/article/${a.slug}`} className="latestrow flex gap-4 items-start cursor-pointer">
              <div className="thumb flex-none w-[112px] h-[88px] overflow-hidden bg-ph relative">
                <Image src={a.cover} alt="" fill sizes="112px" className="media object-cover object-top" />
              </div>
              <div className="min-w-0 pt-[2px]">
                <span className="inline-block font-hanken text-[8.5px] font-bold tracking-[.16em] uppercase text-body-2 bg-fillc rounded-[2px] py-1 px-2">
                  {a.category}
                </span>
                <h3 className="font-playfair font-medium text-[20px] leading-[1.16] mt-[10px] text-ink">{a.title}</h3>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}
