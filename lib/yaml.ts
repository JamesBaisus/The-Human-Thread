/**
 * Quote a value as a YAML double-quoted scalar.
 *
 * Copy from the admin panel routinely contains a colon — "RUBA AL-ESES: THE
 * COURAGE TO BE SEEN" — and bare YAML reads the second one as the start of
 * another mapping key. That fails the parse, and because every page is built
 * from this content it takes the whole production build down with it, which
 * is exactly what happened on 17 October.
 *
 * Wrapping in quotes is not enough on its own: a quote or a backslash inside
 * the value closes the scalar early, so both have to be escaped, along with
 * the newlines and control characters that have no literal form inside one.
 * Unlike the previous helper this is lossless — a title keeps its real
 * quotation marks instead of having them turned into apostrophes.
 */
export function yamlStr(value: unknown): string {
  const escaped = String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, (c) =>
      `\\x${c.charCodeAt(0).toString(16).padStart(2, "0")}`,
    );
  return `"${escaped}"`;
}
