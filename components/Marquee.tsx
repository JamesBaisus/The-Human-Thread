import { site } from "@/content/site";
import SimpleAmp from "@/components/SimpleAmp";

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <span className="mq" aria-hidden={hidden || undefined}>
      {site.taxonomy.map((name) => (
        <span key={name}>
          <SimpleAmp text={name} />
          <span className="mq-dot" />
        </span>
      ))}
    </span>
  );
}

export default function Marquee() {
  return (
    <>
      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)]">
        <div className="border-t border-hairline pt-[clamp(14px,2vw,22px)] text-center font-ui text-[10px] font-black tracking-[.32em] uppercase text-muted-2 mb-[clamp(10px,1.4vw,18px)]">
          What we cover
        </div>
      </div>
      <div className="marquee pt-[clamp(6px,1vw,12px)] pb-[clamp(18px,2.4vw,28px)] border-b border-hairline">
        <div className="marquee-track">
          <Track />
          <Track hidden />
        </div>
      </div>
    </>
  );
}
