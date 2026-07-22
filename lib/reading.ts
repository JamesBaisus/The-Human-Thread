/**
 * Reading-position memory — "pick up where you left off".
 *
 * Stored entirely in the visitor's own browser via localStorage (not a server
 * cookie): the data is only ever read on the client, so there's no reason to
 * ship it to the server on every request. It's functional storage, so it does
 * not need a consent banner — see the note in the privacy policy.
 *
 * Two things are remembered:
 *   - per article: how far the reader scrolled, so we can offer to resume.
 *   - overall: the most recent unfinished article, for the homepage prompt.
 */

import { readingAllowed } from "./consent";

const LAST_KEY = "tht:last-read";
const POS_PREFIX = "tht:pos:";
const posKey = (slug: string) => `${POS_PREFIX}${slug}`;

/** Below this, treat it as "barely started" — not worth resuming. */
const RESUME_MIN = 0.05;
/** At/above this, treat the article as finished — no nudge to continue. */
const FINISHED = 0.9;
/** Forget positions older than this so stale prompts don't reappear. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type LastRead = { slug: string; title: string; category: string; pct: number; at: number };
type Pos = { pct: number; at: number };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled (private mode) — feature just goes quiet */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/** Record progress as the reader scrolls. `pct` is 0–1 of the page scrolled. */
export function saveProgress(slug: string, title: string, category: string, pct: number) {
  if (!readingAllowed()) return;
  const at = Date.now();
  write(LAST_KEY, { slug, title, category, pct, at } satisfies LastRead);
  if (pct >= FINISHED) remove(posKey(slug));
  else write(posKey(slug), { pct, at } satisfies Pos);
}

/** The saved scroll fraction for this article, or null if there's nothing worth resuming to. */
export function getResume(slug: string): number | null {
  if (!readingAllowed()) return null;
  const pos = read<Pos>(posKey(slug));
  if (!pos) return null;
  if (Date.now() - pos.at > MAX_AGE_MS) return null;
  if (pos.pct < RESUME_MIN || pos.pct >= FINISHED) return null;
  return pos.pct;
}

/** Drop the saved position for an article (reader dismissed the prompt or finished). */
export function clearResume(slug: string) {
  remove(posKey(slug));
}

/** Wipe every stored reading position — called when the visitor declines consent. */
export function clearAllReading() {
  try {
    const gone: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === LAST_KEY || k.startsWith(POS_PREFIX))) gone.push(k);
    }
    gone.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* no-op */
  }
}

/** The most recent unfinished article, for the site-wide "continue" bar. */
export function getLastRead(): LastRead | null {
  if (!readingAllowed()) return null;
  const last = read<LastRead>(LAST_KEY);
  if (!last) return null;
  if (Date.now() - last.at > MAX_AGE_MS) return null;
  if (last.pct >= FINISHED) return null;
  return last;
}
