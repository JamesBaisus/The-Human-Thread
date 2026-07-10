/**
 * Serif ampersands (especially Playfair's italic Et-ligature swash) read as
 * decorative. Wherever content renders, this swaps every "&" for the plain
 * upright sans-serif form. Safe in both server and client components.
 */
export default function SimpleAmp({ text }: { text: string }) {
  if (!text.includes("&")) return text;
  const parts = text.split("&");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="not-italic font-hanken">&</span>}
          {part}
        </span>
      ))}
    </>
  );
}
