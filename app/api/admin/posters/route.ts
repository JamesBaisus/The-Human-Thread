import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { site } from "@/content/site";
import { isAuthorized } from "@/lib/admin";
import { commitFiles, getFileText, isGithubConfigured, type CommitFile } from "@/lib/github";

export const maxDuration = 60;

const POSTERS_PATH = "content/posters/posters.json";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

type PosterRecord = {
  slug: string;
  category: string;
  title: string;
  images: string[];
  aspectRatio: string;
  captions: string[];
  hashtags: string;
  note: string;
  time: string;
  handle: string;
  date: string;
};

/** Reads posters.json from GitHub when configured, else local disk (dry-run). */
async function readPosters(): Promise<PosterRecord[]> {
  const text = isGithubConfigured()
    ? await getFileText(POSTERS_PATH)
    : fs.readFileSync(path.join(process.cwd(), "content", "posters", "posters.json"), "utf8");
  return JSON.parse(text) as PosterRecord[];
}

/** "/posters/x/01.jpg" -> "public/posters/x/01.jpg" */
const toRepoPath = (publicPath: string) => `public${publicPath}`;

const parseCaptions = (raw: string) =>
  raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 20);

/** GET: list all posters (summaries), or one full poster with ?slug= for editing. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  try {
    const posters = await readPosters();
    if (slug) {
      const poster = posters.find((p) => p.slug === slug);
      if (!poster) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, poster });
    }
    const list = posters
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        date: p.date,
        cover: p.images[0] ?? "",
        count: p.images.length,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({ ok: true, posters: list });
  } catch (err) {
    console.error("admin poster list failed:", err);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}

/** POST: add a poster — commits posters.json + its images to the repo. */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  const category = String(form.get("category") ?? "").trim();
  const aspectIn = String(form.get("aspectRatio") ?? "").trim();
  const hashtags = String(form.get("hashtags") ?? "").trim().slice(0, 300);
  const note = String(form.get("note") ?? "").trim().slice(0, 400);
  const handle = String(form.get("handle") ?? "").trim().slice(0, 80) || "thehumanthread_ae";
  const captions = parseCaptions(String(form.get("captions") ?? ""));
  const images = form.getAll("images").filter((p): p is File => p instanceof File && p.size > 0);

  if (!title || images.length === 0) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!(site.categories as readonly string[]).includes(category)) {
    return NextResponse.json({ ok: false, error: "bad_category" }, { status: 400 });
  }
  if (images.length > 10) {
    return NextResponse.json({ ok: false, error: "too_many_images" }, { status: 400 });
  }

  const slug = slugify(title);
  if (!slug) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  const aspectRatio = /^\d{1,5}\s*\/\s*\d{1,5}$/.test(aspectIn) ? aspectIn.replace(/\s+/g, " ") : "3 / 4";
  const date = new Date().toISOString().slice(0, 10);

  const poster: PosterRecord = {
    slug,
    category,
    title,
    images: images.map((_, i) => `/posters/${slug}/${String(i + 1).padStart(2, "0")}.jpg`),
    aspectRatio,
    captions,
    hashtags,
    note,
    time: "",
    handle,
    date,
  };

  if (!isGithubConfigured()) {
    return NextResponse.json({ ok: true, demo: true, slug, preview: JSON.stringify(poster, null, 2) });
  }

  try {
    const posters = await readPosters();
    if (posters.some((p) => p.slug === slug)) {
      return NextResponse.json({ ok: false, error: "slug_exists", slug }, { status: 409 });
    }
    const next = [poster, ...posters];

    const files: CommitFile[] = [
      { path: POSTERS_PATH, content: JSON.stringify(next, null, 2) + "\n" },
      ...(await Promise.all(
        images.map(async (img, i) => ({
          path: `public/posters/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
          content: Buffer.from(await img.arrayBuffer()),
        }))
      )),
    ];

    const sha = await commitFiles(`Admin: add poster "${title}" (${slug})`, files);
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin poster add failed:", err);
    return NextResponse.json({ ok: false, error: "add_failed" }, { status: 502 });
  }
}

/** PUT: edit a poster's fields; optionally replace its images. */
export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const slug = String(form.get("slug") ?? "").trim();
  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  const category = String(form.get("category") ?? "").trim();
  const aspectIn = String(form.get("aspectRatio") ?? "").trim();
  const hashtags = String(form.get("hashtags") ?? "").trim().slice(0, 300);
  const note = String(form.get("note") ?? "").trim().slice(0, 400);
  const captions = parseCaptions(String(form.get("captions") ?? ""));
  const newImages = form.getAll("images").filter((p): p is File => p instanceof File && p.size > 0);

  if (!/^[a-z0-9-]+$/.test(slug) || !title) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!(site.categories as readonly string[]).includes(category)) {
    return NextResponse.json({ ok: false, error: "bad_category" }, { status: 400 });
  }
  if (newImages.length > 10) {
    return NextResponse.json({ ok: false, error: "too_many_images" }, { status: 400 });
  }

  try {
    const posters = await readPosters();
    const idx = posters.findIndex((p) => p.slug === slug);
    if (idx < 0) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    const existing = posters[idx];

    const replacing = newImages.length > 0;
    const images = replacing
      ? newImages.map((_, i) => `/posters/${slug}/${String(i + 1).padStart(2, "0")}.jpg`)
      : existing.images;
    const aspectRatio = replacing
      ? /^\d{1,5}\s*\/\s*\d{1,5}$/.test(aspectIn)
        ? aspectIn.replace(/\s+/g, " ")
        : existing.aspectRatio
      : existing.aspectRatio;

    const updated: PosterRecord = { ...existing, title, category, aspectRatio, captions, hashtags, note, images };
    const next = [...posters];
    next[idx] = updated;

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug, preview: JSON.stringify(updated, null, 2) });
    }

    const files: CommitFile[] = [{ path: POSTERS_PATH, content: JSON.stringify(next, null, 2) + "\n" }];
    let deletions: string[] = [];
    if (replacing) {
      files.push(
        ...(await Promise.all(
          newImages.map(async (img, i) => ({
            path: toRepoPath(images[i]),
            content: Buffer.from(await img.arrayBuffer()),
          }))
        ))
      );
      // Delete any old image files beyond the new set.
      deletions = existing.images.filter((p) => !images.includes(p)).map(toRepoPath);
    }

    const sha = await commitFiles(`Admin: update poster "${title}" (${slug})`, files, deletions);
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin poster update failed:", err);
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}

/** DELETE ?slug= : remove a poster and its images. */
export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    const posters = await readPosters();
    const target = posters.find((p) => p.slug === slug);
    if (!target) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    const next = posters.filter((p) => p.slug !== slug);

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug });
    }

    const deletions = target.images.map(toRepoPath);
    const sha = await commitFiles(
      `Admin: remove poster ${slug}`,
      [{ path: POSTERS_PATH, content: JSON.stringify(next, null, 2) + "\n" }],
      deletions
    );
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin poster delete failed:", err);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 502 });
  }
}
