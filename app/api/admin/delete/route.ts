import { NextResponse } from "next/server";
import { commitFiles, isGithubConfigured, listDir } from "@/lib/github";
import { isAuthorized, readArticleList } from "@/lib/admin";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    const file = `${slug}.mdx`;
    if (!(await readArticleList()).includes(file)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug });
    }
    const images = await listDir(`public/articles/${slug}`);
    const deletions = [
      `content/articles/${file}`,
      ...images.map((n) => `public/articles/${slug}/${n}`),
    ];
    const sha = await commitFiles(`Admin: remove article ${slug}`, [], deletions);
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin delete failed:", err);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 502 });
  }
}
