/**
 * The masthead, set as live text rather than artwork.
 *
 * It was a PNG of the lockup, which meant its face could not be changed and
 * it had to be redrawn and re-cut for every size it appeared at. As type it
 * takes the specified face directly, stays sharp on any screen, scales with
 * the viewport, and can be read aloud and searched.
 *
 * `scale` sets the size of the name; the line beneath is sized against it, so
 * the two keep their proportions wherever the mark is used.
 */
export default function Wordmark({
  scale = "clamp(11px, 1.45vw, 17px)",
  className = "",
}: {
  scale?: string;
  className?: string;
}) {
  return (
    <span className={`font-logo block text-center text-ink leading-none select-none ${className}`}>
      <span
        className="block font-bold whitespace-nowrap"
        style={{ fontSize: scale, letterSpacing: "0.045em" }}
      >
        THE HUMAN THREAD AE
      </span>
      <span
        className="block whitespace-nowrap"
        style={{
          fontSize: `calc(${scale} * 0.46)`,
          letterSpacing: "0.42em",
          // the tracking adds a trailing gap that would push the word left
          textIndent: "0.42em",
          marginTop: `calc(${scale} * 0.42)`,
        }}
      >
        EDITORIAL
      </span>
    </span>
  );
}
