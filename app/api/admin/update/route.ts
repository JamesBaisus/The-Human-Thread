import { NextResponse } from "next/server";
import { resolvePhotos } from "@/lib/photos";
import { buildArticleBody } from "@/lib/article-format";
import { site } from "@/content/site";
import { commitFiles, isGithubConfigured, type CommitFile } from "@/lib/github";
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

    // A picture already in the folder is reused rather than written again as
    // a fresh numbered copy, so re-picking the same photo while editing does
    // not make the article print it twice. Pictures are then spaced through
    // the body; they used to be appended, which put every one added by a
    // later edit at the foot of the article.
    const buffers = await Promise.all(
      photos.slice(0, 6).map(async (p) => Buffer.from(await p.arrayBuffer())),
    );
    const resolved = await resolvePhotos(`public/articles/${slug}`, `/articles/${slug}`, buffers);
    const photoFiles: CommitFile[] = resolved
      .filter((r) => r.upload)
      .map((r) => r.upload as CommitFile);
    const body = buildArticleBody(content, resolved.map((r) => r.src));

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
