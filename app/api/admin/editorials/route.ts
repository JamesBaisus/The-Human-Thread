import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthorized } from "@/lib/admin";
import { commitFiles, getFileText, isGithubConfigured, type CommitFile } from "@/lib/github";

export const maxDuration = 60;

const EDITORIALS_PATH = "content/editorials/editorials.json";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

type EditorialRecord = {
  slug: string;
  title: string;
  eyebrow: string;
  images: string[];
  labels: string[];
  date: string;
};

/** Reads editorials.json from GitHub when configured, else local disk (dry-run). */
async function readEditorials(): Promise<EditorialRecord[]> {
  const text = isGithubConfigured()
    ? await getFileText(EDITORIALS_PATH)
    : fs.readFileSync(path.join(process.cwd(), "content", "editorials", "editorials.json"), "utf8");
  return JSON.parse(text) as EditorialRecord[];
}

/** "/carousel/x/01.jpg" -> "public/carousel/x/01.jpg" */
const toRepoPath = (publicPath: string) => `public${publicPath}`;

/** GET: list all editorials (summaries), or one full editorial with ?slug= for editing. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  try {
    const editorials = await readEditorials();
    if (slug) {
      const editorial = editorials.find((e) => e.slug === slug);
      if (!editorial) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, editorial });
    }
    const list = editorials
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        eyebrow: e.eyebrow ?? "",
        date: e.date,
        cover: e.images[0] ?? "",
        count: e.images.length,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({ ok: true, editorials: list });
  } catch (err) {
    console.error("admin editorial list failed:", err);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}

/** POST: add an editorial — commits editorials.json + its images to the repo. */
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
  const eyebrow = String(form.get("eyebrow") ?? "").trim().slice(0, 120);
  const images = form.getAll("images").filter((p): p is File => p instanceof File && p.size > 0);

  if (!title || images.length === 0) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (images.length > 12) {
    return NextResponse.json({ ok: false, error: "too_many_images" }, { status: 400 });
  }

  const slug = slugify(title);
  if (!slug) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  const date = new Date().toISOString().slice(0, 10);

  const editorial: EditorialRecord = {
    slug,
    title,
    eyebrow,
    images: images.map((_, i) => `/carousel/${slug}/${String(i + 1).padStart(2, "0")}.jpg`),
    labels: [],
    date,
  };

  if (!isGithubConfigured()) {
    return NextResponse.json({ ok: true, demo: true, slug, preview: JSON.stringify(editorial, null, 2) });
  }

  try {
    const editorials = await readEditorials();
    if (editorials.some((e) => e.slug === slug)) {
      return NextResponse.json({ ok: false, error: "slug_exists", slug }, { status: 409 });
    }
    const next = [editorial, ...editorials];

    const files: CommitFile[] = [
      { path: EDITORIALS_PATH, content: JSON.stringify(next, null, 2) + "\n" },
      ...(await Promise.all(
        images.map(async (img, i) => ({
          path: `public/carousel/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
          content: Buffer.from(await img.arrayBuffer()),
        }))
      )),
    ];

    const sha = await commitFiles(`Admin: add editorial "${title}" (${slug})`, files);
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin editorial add failed:", err);
    return NextResponse.json({ ok: false, error: "add_failed" }, { status: 502 });
  }
}

/** PUT: edit an editorial's title/eyebrow; optionally replace its images. */
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
  const eyebrow = String(form.get("eyebrow") ?? "").trim().slice(0, 120);
  const newImages = form.getAll("images").filter((p): p is File => p instanceof File && p.size > 0);

  if (!/^[a-z0-9-]+$/.test(slug) || !title) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (newImages.length > 12) {
    return NextResponse.json({ ok: false, error: "too_many_images" }, { status: 400 });
  }

  try {
    const editorials = await readEditorials();
    const idx = editorials.findIndex((e) => e.slug === slug);
    if (idx < 0) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    const existing = editorials[idx];

    const replacing = newImages.length > 0;
    // New images always land in the slug folder; labels reset since pages changed.
    const images = replacing
      ? newImages.map((_, i) => `/carousel/${slug}/${String(i + 1).padStart(2, "0")}.jpg`)
      : existing.images;
    const labels = replacing ? [] : existing.labels;

    const updated: EditorialRecord = { ...existing, title, eyebrow, images, labels };
    const next = [...editorials];
    next[idx] = updated;

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug, preview: JSON.stringify(updated, null, 2) });
    }

    const files: CommitFile[] = [{ path: EDITORIALS_PATH, content: JSON.stringify(next, null, 2) + "\n" }];
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
      deletions = existing.images.filter((p) => !images.includes(p)).map(toRepoPath);
    }

    const sha = await commitFiles(`Admin: update editorial "${title}" (${slug})`, files, deletions);
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin editorial update failed:", err);
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}

/** DELETE ?slug= : remove an editorial and its images. */
export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    const editorials = await readEditorials();
    const target = editorials.find((e) => e.slug === slug);
    if (!target) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    const next = editorials.filter((e) => e.slug !== slug);

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug });
    }

    const deletions = target.images.map(toRepoPath);
    const sha = await commitFiles(
      `Admin: remove editorial ${slug}`,
      [{ path: EDITORIALS_PATH, content: JSON.stringify(next, null, 2) + "\n" }],
      deletions
    );
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin editorial delete failed:", err);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 502 });
  }
}
