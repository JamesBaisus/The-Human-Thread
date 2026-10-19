import { site } from "@/content/site";

/**
 * The letter to readers, drifting sideways on its own.
 *
 * The panels are rendered twice and the track travels half its width, so the
 * loop closes seamlessly. It stops on hover or keyboard focus so a paragraph
 * can actually be finished, and holds still entirely for anyone who has asked
 * for less motion.
 */
export default function CoverLetter() {
  const { eyebrow, title, panels } = site.letter;
  // slow enough that the type reads as drifting rather than scrolling past
  const duration = `${panels.length * 11}s`;

  const Panel = ({ panel, i }: { panel: (typeof panels)[number]; i: number }) => (
    <article className="letterpanel">
      <div className="font-ui text-[10px] font-black tracking-[.3em] text-[rgba(245,245,245,.34)] mb-[clamp(16px,2.2vw,26px)] tabular-nums">
        {String(i + 1).padStart(2, "0")}
      </div>

      {"emphasis" in panel && panel.emphasis ? (
        <p className="font-display font-medium text-ondark text-[clamp(24px,3.2vw,44px)] leading-[1.14] tracking-[-.015em] max-w-[20ch]">
          {panel.lines[0]}
        </p>
      ) : (
        <div className="font-body text-[clamp(17px,1.55vw,21px)] leading-[1.62] text-[rgba(245,245,245,.9)]">
          {panel.lines.map((line, k) => (
            <span key={k} className="block">
              {line}
            </span>
          ))}
        </div>
      )}

      {"tail" in panel && panel.tail && (
        <p className="font-body text-[clamp(17px,1.55vw,21px)] leading-[1.62] text-[rgba(245,245,245,.9)] mt-[clamp(20px,2.6vw,30px)]">
          {panel.tail}
        </p>
      )}

      {"signoff" in panel && panel.signoff && (
        <div className="mt-auto pt-[clamp(24px,3vw,38px)]">
          <div className="font-logo font-bold text-[22px] tracking-[.06em] leading-none text-ondark">THT</div>
          <div className="font-ui text-[8.5px] font-black tracking-[.4em] uppercase text-[rgba(245,245,245,.52)] mt-[7px]">
            The Human Thread_AE
          </div>
          <div className="font-ui text-[8.5px] tracking-[.24em] uppercase text-[rgba(245,245,245,.38)] mt-[6px]">
            {panel.signoff}
          </div>
        </div>
      )}
    </article>
  );

  return (
    <section className="glossblack relative text-ondark overflow-hidden mt-[clamp(20px,3vw,36px)] py-[clamp(44px,6vw,86px)]">
      <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] mb-[clamp(26px,3.4vw,44px)]">
        <div data-reveal="left">
          <div className="font-ui text-[10px] font-black tracking-[.32em] uppercase text-[rgba(245,245,245,.62)] mb-[14px]">
            {eyebrow}
          </div>
          <h2 className="font-display font-medium text-ondark text-[clamp(34px,5.6vw,78px)] leading-[.94] tracking-[-.02em] uppercase">
            {title}
          </h2>
        </div>
      </div>

      <div className="lettermarquee" tabIndex={0} aria-label={title}>
        <div className="lettermarquee-track" style={{ animationDuration: duration }}>
          {panels.map((panel, i) => (
            <Panel key={i} panel={panel} i={i} />
          ))}
          {/* a second pass, so the loop has something to run into */}
          {panels.map((panel, i) => (
            <Panel key={`echo-${i}`} panel={panel} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
