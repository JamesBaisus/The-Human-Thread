import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthorized } from "@/lib/admin";
import { commitFiles, getFileText, isGithubConfigured } from "@/lib/github";

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

  // Not connected to GitHub yet → return a preview so the flow can be tested.
  if (!isGithubConfigured()) {
    return NextResponse.json({ ok: true, demo: true, slug, preview: JSON.stringify(editorial, null, 2) });
  }

  try {
    const editorials = await readEditorials();
    if (editorials.some((e) => e.slug === slug)) {
      return NextResponse.json({ ok: false, error: "slug_exists", slug }, { status: 409 });
    }
    const next = [editorial, ...editorials];

    const files = [
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
