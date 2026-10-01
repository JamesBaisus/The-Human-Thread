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

/**
 * Enough copies that the band still spans the widest screen after one set has
 * scrolled past. Six short words make a set about 730px wide, so two copies
 * left the track narrower than the viewport and the words bunched to one side.
 */
const COPIES = 8;

export default function Marquee() {
  return (
    <>
      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)]">
        <div className="border-t border-hairline pt-[clamp(14px,2vw,22px)] text-center font-ui text-[10px] font-black tracking-[.32em] uppercase text-muted-2 mb-[clamp(10px,1.4vw,18px)]">
          What we cover
        </div>
      </div>
      <div className="marquee pt-[clamp(6px,1vw,12px)] pb-[clamp(18px,2.4vw,28px)] border-b border-hairline">
        <div className="marquee-track" style={{ ["--copies" as string]: COPIES }}>
          {Array.from({ length: COPIES }, (_, i) => (
            <Track key={i} hidden={i > 0} />
          ))}
        </div>
      </div>
    </>
  );
}
