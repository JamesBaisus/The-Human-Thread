/**
 * Playfair Display's italic "&" is an ornate Et-ligature swash. Wherever
 * content renders in italic serif, this renders ampersands upright so they
 * read as a plain, simple mark. Safe in both server and client components.
 */
export default function SimpleAmp({ text }: { text: string }) {
  if (!text.includes("&")) return text;
  const parts = text.split("&");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="not-italic">&</span>}
          {part}
        </span>
      ))}
    </>
  );
}
