/**
 * Ampersands used to need special handling: Playfair's italic Et-ligature
 * swash read as decorative, so every "&" was forced upright and into the sans
 * face. The magazine is now set in one sans family whose "&" is plain in both
 * styles, so the text passes through untouched — forcing it upright would only
 * break the ampersand out of an italic deck or pull quote.
 *
 * Kept as a component so the call sites stay put and a future display face can
 * reintroduce the fix in one place. Safe in both server and client components.
 */
export default function SimpleAmp({ text }: { text: string }) {
  return text;
}
