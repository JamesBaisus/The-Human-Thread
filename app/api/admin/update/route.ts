import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { commitFiles, isGithubConfigured, listDir, type CommitFile } from "@/lib/github";
import { buildMdx, dethroneOthers, isAuthorized, parseArticleFile, readArticleList, readArticleText } from "@/lib/admin";

export const maxDuration = 60;

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

  const slug = String(form.get("slug") ?? "").trim();
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const role = String(form.get("role") ?? "").trim().slice(0, 160);
  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  const deck = String(form.get("deck") ?? "").trim().slice(0, 300);
  const category = String(form.get("category") ?? "").trim();
  const featured = String(form.get("featured") ?? "") === "true";
  const accentIn = String(form.get("accent") ?? "").trim();
  const content = String(form.get("content") ?? "").trim().slice(0, 60000);
  const cover = form.get("cover");
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);

  if (!slug || !name || !role || !title || !content) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!(site.categories as readonly string[]).includes(category)) {
    return NextResponse.json({ ok: false, error: "bad_category" }, { status: 400 });
  }

  try {
    const file = `${slug}.mdx`;
    if (!(await readArticleList()).includes(file)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const existing = parseArticleFile(file, await readArticleText(file));

    // New photos get numbered after whatever already exists and are appended to the body.
    let body = content;
    let nextPhoto = 1;
    if (photos.length > 0 && isGithubConfigured()) {
      const dir = await listDir(`public/articles/${slug}`);
      const nums = dir.map((n) => parseInt(n.match(/^(\d+)\.jpg$/)?.[1] ?? "0", 10));
      nextPhoto = Math.max(0, ...nums) + 1;
    }
    const photoFiles: CommitFile[] = [];
    photos.slice(0, 6).forEach((p, i) => {
      const n = String(nextPhoto + i).padStart(2, "0");
      body += `\n\n![](/articles/${slug}/${n}.jpg)`;
      photoFiles.push({ path: `public/articles/${slug}/${n}.jpg`, content: Buffer.from("") });
    });
    // fill photo contents (async)
    for (let i = 0; i < photoFiles.length; i++) {
      photoFiles[i].content = Buffer.from(await photos[i].arrayBuffer());
    }

    const words = content.split(/\s+/).length;
    const mdx = buildMdx({
      slug,
      name,
      role,
      category,
      title,
      deck: deck || existing.deck || title,
      readTime: `${Math.max(2, Math.round(words / 200))} min read`,
      accent: /^#[0-9a-fA-F]{6}$/.test(accentIn) ? accentIn : existing.accent || site.accent,
      featured,
      hidden: existing.hidden,
      date: existing.date || new Date().toISOString().slice(0, 10),
      body,
    });

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug, preview: mdx });
    }

    const files: CommitFile[] = [{ path: `content/articles/${file}`, content: mdx }, ...photoFiles];
    if (cover instanceof File && cover.size > 0) {
      files.push({ path: `public/articles/${slug}/cover.jpg`, content: Buffer.from(await cover.arrayBuffer()) });
    }
    if (featured && !existing.featured) {
      files.push(...(await dethroneOthers(slug)));
    }

    const sha = await commitFiles(`Admin: update article "${title}" (${slug})`, files);
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin update failed:", err);
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}
