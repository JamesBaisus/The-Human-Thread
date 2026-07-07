import { site } from "@/content/site";

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <span className="mq" aria-hidden={hidden || undefined}>
      {site.marqueeNames.map((name) => (
        <span key={name}>
          {name}
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
        <div className="border-t border-hairline pt-[clamp(14px,2vw,22px)] text-center font-hanken text-[10px] font-semibold tracking-[.32em] uppercase text-muted-2 mb-[clamp(10px,1.4vw,18px)]">
          Featured in this issue
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
