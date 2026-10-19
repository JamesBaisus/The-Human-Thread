import crypto from "crypto";
import { listDirEntries } from "@/lib/github";

/**
 * Git's hash for a file's contents: sha1 over `blob <length>\0` and the bytes.
 * It is what GitHub returns as a listing's `sha`, so the same picture uploaded
 * twice hashes the same both times and can be recognised without downloading
 * anything.
 */
export function gitBlobSha(bytes: Buffer): string {
  return crypto
    .createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
}

export type ResolvedPhoto = {
  /** Where the picture lives, for the `![](...)` in the body. */
  src: string;
  /** Set only when the file is new and has to be committed. */
  upload?: { path: string; content: Buffer };
};

/**
 * Work out where each uploaded picture should live.
 *
 * Editing an article means re-picking its photos, so the same file arrives
 * again and used to be written as a fresh numbered copy — the article then
 * printed the same picture twice and the repo carried two identical blobs.
 * A picture whose contents are already in the folder reuses the file that is
 * there; only genuinely new ones are given the next number. Repeats inside a
 * single upload collapse the same way.
 */
export async function resolvePhotos(
  /** Repo folder the files live in, e.g. `public/articles/sid`. */
  dir: string,
  /** What the body links to, e.g. `/articles/sid` or `/edit/celine-dion`. */
  urlPrefix: string,
  buffers: Buffer[],
): Promise<ResolvedPhoto[]> {
  const existing = await listDirEntries(dir);

  // sha -> the file already holding those exact bytes
  const bySha = new Map<string, string>();
  for (const entry of existing) {
    if (/^\d+\.jpg$/.test(entry.name)) bySha.set(entry.sha, entry.name);
  }

  const used = existing
    .map((e) => parseInt(e.name.match(/^(\d+)\.jpg$/)?.[1] ?? "0", 10))
    .filter((n) => n > 0);
  let next = Math.max(0, ...used) + 1;

  return buffers.map((bytes) => {
    const sha = gitBlobSha(bytes);
    const already = bySha.get(sha);
    if (already) return { src: `${urlPrefix}/${already}` };

    const name = `${String(next++).padStart(2, "0")}.jpg`;
    // remember it, so the same picture twice in one upload lands once
    bySha.set(sha, name);
    return {
      src: `${urlPrefix}/${name}`,
      upload: { path: `${dir}/${name}`, content: bytes },
    };
  });
}
