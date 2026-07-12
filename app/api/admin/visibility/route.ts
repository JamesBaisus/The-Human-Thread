import { NextResponse } from "next/server";
import { commitFiles, isGithubConfigured } from "@/lib/github";
import { isAuthorized, readArticleList, readArticleText } from "@/lib/admin";

export const maxDuration = 60;

/** POST { slug, hidden } — toggles the `hidden: true` frontmatter flag.
 *  Hidden articles disappear from the whole public site but stay in the
 *  repo and in the admin panel, ready to be unhidden. */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { slug?: string; hidden?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const hidden = Boolean(body.hidden);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    const file = `${slug}.mdx`;
    if (!(await readArticleList()).includes(file)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const text = await readArticleText(file);
    const isHidden = /^hidden:\s*true\s*$/m.test(text);
    if (isHidden === hidden) {
      return NextResponse.json({ ok: true, slug, hidden, unchanged: true });
    }
    const updated = hidden
      ? text.replace(/^date:/m, "hidden: true\ndate:") // insert just above the date line
      : text.replace(/^hidden:\s*true\s*\r?\n/m, "");

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug, hidden, preview: updated.split("---")[1] });
    }
    const sha = await commitFiles(
      `Admin: ${hidden ? "hide" : "unhide"} article ${slug}`,
      [{ path: `content/articles/${file}`, content: updated }]
    );
    return NextResponse.json({ ok: true, slug, hidden, commit: sha });
  } catch (err) {
    console.error("admin visibility failed:", err);
    return NextResponse.json({ ok: false, error: "visibility_failed" }, { status: 502 });
  }
}
