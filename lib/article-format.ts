/**
 * Turning pasted copy into a laid-out article.
 *
 * Writers paste plain prose from a document: headings are bare Title Case
 * lines, quotes are sentences inside quotation marks, and nothing carries a
 * markdown marker. The reader only promotes a line to a heading when it
 * begins `## ` and to a pull quote when it begins `> `, so pasted copy used
 * to arrive as one flat run of paragraphs with no large quotes at all.
 *
 * That also moved the pictures. A section renders every one of its paragraphs
 * before any of its images, so an article with no headings is a single
 * section and every picture is forced to the very end however it was placed.
 * Marking the headings is therefore what lets a picture sit mid-article.
 *
 * Both are inferred here, at publish time, so the .mdx that lands in the repo
 * is properly marked up and can still be edited by hand afterwards.
 */

/** Words allowed to stay lowercase inside a title. */
const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "nor", "of", "to", "in", "on", "at",
  "for", "from", "with", "by", "as", "into", "onto", "over", "under", "out",
  "up", "off", "per", "via", "vs", "is", "it",
]);

/** A line already carrying its own markdown is left exactly as written. */
const ALREADY_MARKED = /^(#{1,6}\s|>|!\[|-{3,}$)/;

/**
 * A heading is short, carries no terminal punctuation, and capitalises every
 * word that is not a minor one. Requiring full title case is what keeps
 * ordinary sentences out: "She stopped disappearing" has two lowercase
 * significant words and so stays a paragraph, while "Finding Her Voice" does
 * not.
 */
export function looksLikeHeading(line: string): boolean {
  if (line.length > 64) return false;
  if (/[.!?,;:]$/.test(line)) return false;
  if (/["”»’]$/.test(line)) return false;

  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 9) return false;

  let significant = 0;
  let capitalised = 0;
  for (const word of words) {
    const bare = word.replace(/[^\p{L}\p{N}]/gu, "");
    if (!bare) continue;
    if (MINOR_WORDS.has(bare.toLowerCase())) continue;
    significant++;
    if (/^[\p{Lu}\p{N}]/u.test(bare)) capitalised++;
  }
  return significant >= 2 && capitalised === significant;
}

/**
 * A line wholly inside quotation marks is the writer setting a quote apart,
 * which a magazine prints large. The marks come off because the pull quote is
 * already set as one. A very long quoted passage is left as body copy.
 */
export function asPullQuote(line: string): string | null {
  const match = line.match(/^["“«‘]([\s\S]+)["”»’]$/);
  if (!match) return null;
  const inner = match[1].trim();
  if (!inner || inner.length > 240) return null;
  return inner;
}

/**
 * Mark up pasted prose. Idempotent: anything already carrying a marker is
 * passed through untouched, so re-saving an article cannot double-convert it.
 */
export function formatBody(content: string): string {
  const out: string[] = [];
  for (const raw of content.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      out.push("");
      continue;
    }
    if (ALREADY_MARKED.test(line)) {
      out.push(line);
      continue;
    }
    const quote = asPullQuote(line);
    if (quote) {
      out.push(`> ${quote}`);
      continue;
    }
    if (looksLikeHeading(line)) {
      out.push(`## ${line}`);
      continue;
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Space pictures through a marked-up body.
 *
 * A picture belongs just before the next heading, where it closes the section
 * it was written into — the reader prints that section's paragraphs, then its
 * images, then moves on. Where there are not enough headings to carry them,
 * each picture is given a bare `---` break of its own, which opens the next
 * section so the picture stays where it was put instead of sliding to the end.
 */
export function placePhotos(mdx: string, sources: string[]): string {
  // A picture is placed once. The same file can arrive twice — re-picked while
  // editing, so it resolves to the path already written into the body, or
  // chosen twice in one upload — and printing it again is never what was
  // meant.
  const alreadyInBody = new Set(
    [...mdx.matchAll(/^!\[[^\]]*\]\(([^)\s]+)\)$/gm)].map((m) => m[1]),
  );
  sources = [...new Set(sources)].filter((src) => !alreadyInBody.has(src));
  if (sources.length === 0) return mdx;

  const lines = mdx.split("\n");
  const boundaries: number[] = [];
  lines.forEach((line, i) => {
    if (i > 0 && /^##\s/.test(line)) boundaries.push(i);
  });

  const useBreak = boundaries.length < sources.length;
  const picks = sources.map((_, i) =>
    useBreak
      ? Math.max(1, Math.floor(((i + 1) * lines.length) / (sources.length + 1)))
      : boundaries[Math.floor(((i + 1) * boundaries.length) / (sources.length + 1))],
  );

  // inserted from the back so the earlier indexes stay valid
  for (let i = sources.length - 1; i >= 0; i--) {
    const block = useBreak
      ? ["", `![](${sources[i]})`, "", "---", ""]
      : ["", `![](${sources[i]})`, ""];
    lines.splice(picks[i], 0, ...block);
  }

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    // a break with nothing after it would open an empty section
    .replace(/\n-{3,}\s*$/, "")
    .trim();
}

/** Mark up pasted copy and space the pictures through it, in one step. */
export function buildArticleBody(content: string, sources: string[]): string {
  return placePhotos(formatBody(content), sources);
}
