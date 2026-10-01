/**
 * The mark: "The" riding high, the name in the italic Didone, "_AE" dropping
 * low off the final d.
 *
 * Set `font-size` and the lockup scales with it. The small caps carry a floor
 * in px as well as a ratio: at the size a sticky header can afford, a strict
 * proportion would put "The" at about five pixels, which is a smudge rather
 * than a word.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-the">The</span>
      <span className="wordmark-name">Human&nbsp;Thread</span>
      <span className="wordmark-ae">_AE</span>
    </span>
  );
}
