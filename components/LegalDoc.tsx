import Link from "next/link";
import SimpleAmp from "@/components/SimpleAmp";

export type LegalSection = { h: string; ps: string[] };

export default function LegalDoc({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="pg">
      <section className="max-w-[760px] mx-auto pt-[clamp(40px,6vw,86px)] pb-[clamp(20px,3vw,34px)] px-[clamp(18px,4vw,40px)]">
        <Link href="/#top" className="navlink cursor-pointer font-hanken text-[11px] tracking-[.2em] uppercase text-muted">
          ← Back to the issue
        </Link>
        <div className="font-hanken text-[11px] font-semibold tracking-[.3em] uppercase text-ink mt-[clamp(26px,3.4vw,40px)] mb-4">
          {eyebrow}
        </div>
        <h1 className="font-playfair font-normal text-[clamp(38px,6vw,72px)] leading-[.95] tracking-[-.015em]">
          <SimpleAmp text={title} />
        </h1>
        <p className="font-hanken text-[10px] tracking-[.2em] uppercase text-muted-2 mt-5">Last updated · {updated}</p>
        <p className="font-playfair italic text-[clamp(17px,1.9vw,22px)] leading-[1.5] text-body-1 mt-6 max-w-[52ch]">
          {intro}
        </p>
      </section>
      <section className="max-w-[760px] mx-auto pt-[clamp(10px,2vw,20px)] pb-[clamp(56px,8vw,110px)] px-[clamp(18px,4vw,40px)]">
        <div className="border-t border-hairline">
          {sections.map((s, i) => (
            <section key={i} data-reveal="" className="py-[clamp(18px,2.6vw,30px)] border-b border-ph">
              <h2 className="font-hanken font-bold text-[clamp(11px,1vw,12.5px)] tracking-[.18em] uppercase text-ink mb-[14px]">
                {String(i + 1).padStart(2, "0")} · {s.h}
              </h2>
              {s.ps.map((p, k) => (
                <p key={k} className="text-[clamp(15.5px,1.3vw,17.5px)] leading-[1.72] text-ink-2 mb-4 last:mb-0">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
