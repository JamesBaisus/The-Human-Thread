import { site } from "@/content/site";

/**
 * The mark: "The" riding high, the name in the italic Didone, "_AE" dropping
 * low off the final d, and what the journal covers set beneath it.
 *
 * Set `font-size` and the lockup scales with it. The small caps carry a floor
 * in px as well as a ratio: at the size a sticky header can afford, a strict
 * proportion would put "The" at about five pixels, which is a smudge rather
 * than a word. Below 430px the line beneath is dropped rather than shrunk,
 * since the header has no room left for it beside the menu and the controls.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-line">
        <span className="wordmark-the">The</span>
        <span className="wordmark-name">Human&nbsp;Thread</span>
        <span className="wordmark-ae">_AE</span>
      </span>
      <span className="wordmark-tax">
        {site.taxonomy.map((w, i) => (
          <span key={w}>
            {i > 0 && <i>·</i>}
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
