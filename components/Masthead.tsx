import { site } from "@/content/site";

/**
 * The printed masthead, at the head of the landing page only — the sticky
 * header keeps its compact wordmark so navigation still works on the way down.
 *
 * Everything is sized in em against one clamped font-size, so the tuck of
 * "The" into the shoulder of the H and the drop of "_AE" off the final d hold
 * their proportions at every width instead of drifting apart.
 */
export default function Masthead() {
  return (
    <section className="masthead-shell max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pt-[clamp(18px,3vw,40px)] pb-[clamp(6px,1.2vw,14px)]">
      <div data-reveal="" className="masthead">
        <h1 className="masthead-line">
          <span className="masthead-the">The</span>
          <span className="masthead-name">Human&nbsp;Thread</span>
          <span className="masthead-ae">_AE</span>
        </h1>
        <span className="masthead-rule" />
        <p className="masthead-tax">
          {site.mastheadWords.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </p>
        <span className="masthead-rule" />
      </div>
    </section>
  );
}
