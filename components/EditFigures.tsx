import Image from "next/image";
import type { ArticleSection, SectionImage } from "@/lib/content";
import SimpleAmp from "@/components/SimpleAmp";
import ArticleFilm from "@/components/ArticleFilm";

/**
 * Body of a THT Edit page: one centred column, same figure vocabulary as the
 * feature reader.
 *
 * Edit pieces run from about 60 to 400 words, so a single fixed rhythm leaves
 * the short ones stranded in white space and the long ones cramped. The type
 * scale and the gaps are chosen from the piece's own length instead, which
 * keeps a 60-word card and a 400-word one looking like the same publication.
 */

type Density = "roomy" | "even" | "close";

const SCALE: Record<Density, { body: string; gap: string; figure: string; quote: string }> = {
  roomy: {
    body: "text-[clamp(19px,1.75vw,23px)] leading-[1.72]",
    gap: "mb-[clamp(26px,3.4vw,38px)]",
    figure: "my-[clamp(34px,5vw,60px)]",
    quote: "text-[clamp(25px,3.1vw,38px)]",
  },
  even: {
    body: "text-[clamp(17.5px,1.5vw,20.5px)] leading-[1.74]",
    gap: "mb-[clamp(22px,2.8vw,30px)]",
    figure: "my-[clamp(30px,4.4vw,52px)]",
    quote: "text-[clamp(23px,2.8vw,34px)]",
  },
  close: {
    body: "text-[clamp(17px,1.4vw,19.5px)] leading-[1.76]",
    gap: "mb-[22px]",
    figure: "my-[clamp(28px,4vw,48px)]",
    quote: "text-[clamp(22px,2.6vw,32px)]",
  },
};

/** Solo figure widths inside the centred column, from the MDX `|hint`. */
const SOLO: Record<string, string> = {
  wide: "",
  right: "min-[620px]:w-[76%] min-[620px]:ml-auto",
  left: "min-[620px]:w-[76%] min-[620px]:mr-auto",
  inset: "min-[620px]:max-w-[80%] mx-auto",
  flip: "",
  triptych: "",
};

function Frame({ media, alt, sizes, accent }: { media: SectionImage; alt: string; sizes: string; accent: string }) {
  if (media.poster) {
    return (
      <ArticleFilm
        src={media.src}
        poster={media.poster}
        posterBlur={media.blur}
        width={media.width}
        height={media.height}
        caption={media.caption || alt}
        accent={accent}
        sound={media.sound}
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-[2px] bg-ph">
      <Image
        src={media.src}
        alt={media.caption || alt}
        width={media.width}
        height={media.height}
        placeholder="blur"
        blurDataURL={media.blur}
        sizes={sizes}
        className="block w-full h-auto"
      />
    </div>
  );
}

/** Inline caption for a full-width figure; `stacked` for narrow grid columns. */
function Caption({ no, text, stacked }: { no: string; text: string; stacked?: boolean }) {
  if (stacked) {
    return (
      <figcaption className="mt-[10px]">
        <span className="flex items-center gap-2 mb-[6px]">
          <span className="font-ui text-[9px] font-black tracking-[.26em] uppercase whitespace-nowrap text-ink">
            No. {no}
          </span>
          <span className="flex-1 h-px bg-hairline" />
        </span>
        <span className="block font-display italic text-[12.5px] leading-[1.5] text-muted">
          <SimpleAmp text={text} />
        </span>
      </figcaption>
    );
  }
  return (
    <figcaption className="flex items-center gap-3 mt-[12px]">
      <span className="font-ui text-[9px] font-black tracking-[.26em] uppercase whitespace-nowrap text-ink">
        No. {no}
      </span>
      <span className="flex-1 h-px bg-hairline" />
      <span className="font-display italic text-[12.5px] leading-[1.5] text-muted text-right max-w-[42ch]">
        <SimpleAmp text={text} />
      </span>
    </figcaption>
  );
}

export default function EditFigures({
  sections,
  accent,
  title,
}: {
  sections: ArticleSection[];
  accent: string;
  title: string;
}) {
  const words = sections.reduce((n, s) => n + s.paragraphs.join(" ").split(/\s+/).filter(Boolean).length, 0);
  const density: Density = words < 130 ? "roomy" : words < 300 ? "even" : "close";
  const t = SCALE[density];

  let figCount = 0;
  const figNo = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <div>
      {sections.map((sec, i) => {
        const figStart = figCount;
        figCount += sec.images.length;
        const triptych = sec.images.length === 3;
        return (
          <section key={i} data-reveal="rise" className={i > 0 ? "pt-[clamp(10px,2vw,20px)]" : ""}>
            {sec.heading && (
              <h2
                className="font-ui font-black text-[clamp(11px,1vw,13px)] tracking-[.18em] uppercase text-ink mb-4 pt-[clamp(12px,2vw,20px)] inline-block border-t-2"
                style={{ borderTopColor: accent }}
              >
                {sec.heading}
              </h2>
            )}

            {sec.paragraphs.map((para, k) => (
              <p key={k} className={`${t.body} ${t.gap} text-ink-2 [text-wrap:pretty]`}>
                {para}
              </p>
            ))}

            {sec.images.length === 1 && (
              <figure data-reveal="scale" className={`${t.figure} ${SOLO[sec.images[0].layout ?? "wide"] ?? ""}`}>
                <Frame
                  media={sec.images[0]}
                  alt={title}
                  accent={accent}
                  sizes="(max-width: 820px) 100vw, 740px"
                />
                <Caption no={figNo(figStart)} text={sec.images[0].caption} />
              </figure>
            )}

            {sec.images.length === 2 && (
              <div className={`${t.figure} grid grid-cols-2 max-[560px]:grid-cols-1 gap-[clamp(14px,2.2vw,26px)] items-start`}>
                {sec.images.map((im, k) => (
                  <figure key={im.src} data-reveal="scale" data-reveal-delay={k ? "130" : undefined}>
                    <Frame media={im} alt={title} accent={accent} sizes="(max-width: 560px) 100vw, 360px" />
                    <Caption no={figNo(figStart + k)} text={im.caption} stacked />
                  </figure>
                ))}
              </div>
            )}

            {triptych && (
              <div className={`${t.figure} grid grid-cols-3 max-[560px]:grid-cols-1 gap-[clamp(10px,1.8vw,20px)] items-start`}>
                {sec.images.map((im, k) => (
                  <figure
                    key={im.src}
                    data-reveal="scale"
                    data-reveal-delay={k ? String(k * 120) : undefined}
                    className={k === 1 ? "min-[561px]:mt-[clamp(20px,4vw,50px)]" : ""}
                  >
                    <Frame media={im} alt={title} accent={accent} sizes="(max-width: 560px) 100vw, 240px" />
                    <Caption no={figNo(figStart + k)} text={im.caption} stacked />
                  </figure>
                ))}
              </div>
            )}

            {sec.images.length > 3 && (
              <div className={`${t.figure} grid grid-cols-2 max-[560px]:grid-cols-1 gap-[clamp(14px,2.2vw,26px)] items-start`}>
                {sec.images.map((im, k) => (
                  <figure
                    key={im.src}
                    data-reveal="scale"
                    data-reveal-delay={k ? String((k % 2) * 130) : undefined}
                    className={k % 2 === 1 ? "min-[561px]:mt-[clamp(22px,4.5vw,56px)]" : ""}
                  >
                    <Frame media={im} alt={title} accent={accent} sizes="(max-width: 560px) 100vw, 360px" />
                    <Caption no={figNo(figStart + k)} text={im.caption} stacked />
                  </figure>
                ))}
              </div>
            )}

            {sec.pullQuote && (
              <blockquote
                className="mt-[clamp(18px,2.8vw,30px)] mb-[clamp(20px,3vw,32px)] pl-[24px] border-l-2"
                style={{ borderLeftColor: accent }}
              >
                <span className={`font-display italic ${t.quote} leading-[1.16] text-ink`}>
                  <SimpleAmp text={sec.pullQuote} />
                </span>
              </blockquote>
            )}
          </section>
        );
      })}
    </div>
  );
}
