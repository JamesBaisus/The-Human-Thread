import { NextResponse } from "next/server";
import { isAuthorized, parseArticleFile, readArticleList, readArticleText } from "@/lib/admin";

export const maxDuration = 60;

/** GET: list all articles (summaries), or one full article with ?slug= for editing. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  try {
    if (slug) {
      const file = `${slug}.mdx`;
      const files = await readArticleList();
      if (!files.includes(file)) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      const article = parseArticleFile(file, await readArticleText(file));
      return NextResponse.json({ ok: true, article });
    }
    const articles = await Promise.all(
      (await readArticleList()).map(async (file) => {
        const a = parseArticleFile(file, await readArticleText(file));
        return { slug: a.slug, name: a.name, role: a.role, title: a.title, category: a.category, date: a.date, featured: a.featured };
      })
    );
    articles.sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({ ok: true, articles });
  } catch (err) {
    console.error("admin list failed:", err);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}
