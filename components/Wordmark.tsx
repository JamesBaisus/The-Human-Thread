import { site } from "@/content/site";

/**
 * The mark: "The" riding high, the name in the italic Didone, "_AE" dropping
 * low off the final d, then the rule, what the journal covers, and the second
 * rule.
 *
 * Set `font-size` and the lockup scales with it. The small caps carry a floor
 * in px as well as a ratio: at the size a sticky header can afford, a strict
 * proportion would put "The" at about five pixels, which is a smudge rather
 * than a word. Below 900px the rules and the line between them are dropped
 * rather than shrunk, since six words across a phone-width mark would be
 * illegible at any setting.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-line">
        <span className="wordmark-the">The</span>
        <span className="wordmark-name">Human&nbsp;Thread</span>
        <span className="wordmark-ae">_AE</span>
      </span>
      <span className="wordmark-rule" />
      <span className="wordmark-tax">
        {site.taxonomy.map((w, i) => (
          <span key={w}>
            {i > 0 && <i>·</i>}
            {w}
          </span>
        ))}
      </span>
      <span className="wordmark-rule" />
    </span>
  );
}
