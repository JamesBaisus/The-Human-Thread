import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { site } from "@/content/site";
import { isAuthorized } from "@/lib/admin";
import { commitFiles, getFileText, isGithubConfigured } from "@/lib/github";

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
  const captions = String(form.get("captions") ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 20);
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

  // Not connected to GitHub yet → return a preview so the flow can be tested.
  if (!isGithubConfigured()) {
    return NextResponse.json({ ok: true, demo: true, slug, preview: JSON.stringify(poster, null, 2) });
  }

  try {
    const posters = await readPosters();
    if (posters.some((p) => p.slug === slug)) {
      return NextResponse.json({ ok: false, error: "slug_exists", slug }, { status: 409 });
    }
    const next = [poster, ...posters];

    const files = [
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
