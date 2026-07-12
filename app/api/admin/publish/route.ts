import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { commitFiles, getFileText, isGithubConfigured, listArticleFiles, type CommitFile } from "@/lib/github";

export const maxDuration = 60;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/** Body text arrives as plain text with the MDX conventions:
 *  blank-line paragraphs, optional `## Heading` and `> pull quote` lines.
 *  Article pictures are distributed evenly between top-level blocks. */
function buildBody(content: string, slug: string, photoCount: number): string {
  const blocks = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (photoCount > 0 && blocks.length > 0) {
    const insertions: { at: number; line: string }[] = [];
    for (let i = 0; i < photoCount; i++) {
      const at = Math.min(blocks.length, Math.ceil(((i + 1) * blocks.length) / (photoCount + 1)));
      insertions.push({ at, line: `![](/articles/${slug}/${String(i + 1).padStart(2, "0")}.jpg)` });
    }
    // insert from the back so earlier indexes stay valid
    for (const ins of insertions.reverse()) blocks.splice(ins.at, 0, ins.line);
  }
  return blocks.join("\n\n");
}

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password") ?? "";
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    // Without ADMIN_PASSWORD configured the panel is locked entirely.
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const role = String(form.get("role") ?? "").trim().slice(0, 160);
  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  const deckIn = String(form.get("deck") ?? "").trim().slice(0, 300);
  const category = String(form.get("category") ?? "").trim();
  const featured = String(form.get("featured") ?? "") === "true";
  const accentIn = String(form.get("accent") ?? "").trim();
  const content = String(form.get("content") ?? "").trim().slice(0, 60000);
  const cover = form.get("cover");
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);

  if (!name || !role || !title || !content || !(cover instanceof File) || cover.size === 0) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!(site.categories as readonly string[]).includes(category)) {
    return NextResponse.json({ ok: false, error: "bad_category" }, { status: 400 });
  }
  if (photos.length > 6) {
    return NextResponse.json({ ok: false, error: "too_many_photos" }, { status: 400 });
  }

  const slug = slugify(name) || slugify(title);
  const accent = /^#[0-9a-fA-F]{6}$/.test(accentIn) ? accentIn : site.accent;
  const words = content.split(/\s+/).length;
  const readTime = `${Math.max(2, Math.round(words / 200))} min read`;
  const date = new Date().toISOString().slice(0, 10);
  const deck = deckIn || content.replace(/^[#>!].*$/gm, "").trim().split(/(?<=[.!?])\s/)[0]?.slice(0, 200) || title;

  const mdx = `---
slug: ${slug}
name: ${name}
role: ${role}
category: ${category}
title: ${title}
deck: "${deck.replace(/"/g, "'")}"
readTime: ${readTime}
accent: "${accent}"
cover: /articles/${slug}/cover.jpg
${featured ? "featured: true\n" : ""}date: ${date}
---

${buildBody(content, slug, photos.length)}
`;

  // Not connected to GitHub yet → return a preview so the flow can be tested.
  if (!isGithubConfigured()) {
    return NextResponse.json({ ok: true, demo: true, slug, preview: mdx });
  }

  try {
    const existing = await listArticleFiles();
    if (existing.includes(`${slug}.mdx`)) {
      return NextResponse.json({ ok: false, error: "slug_exists", slug }, { status: 409 });
    }

    const files: CommitFile[] = [
      { path: `content/articles/${slug}.mdx`, content: mdx },
      { path: `public/articles/${slug}/cover.jpg`, content: Buffer.from(await cover.arrayBuffer()) },
      ...(await Promise.all(
        photos.map(async (p, i) => ({
          path: `public/articles/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
          content: Buffer.from(await p.arrayBuffer()),
        }))
      )),
    ];

    // A featured article dethrones the current one in the same commit.
    if (featured) {
      for (const file of existing) {
        const text = await getFileText(`content/articles/${file}`);
        if (/^featured:\s*true\s*$/m.test(text)) {
          files.push({
            path: `content/articles/${file}`,
            content: text.replace(/^featured:\s*true\s*$/m, "featured: false"),
          });
        }
      }
    }

    const sha = await commitFiles(
      `Admin: publish article "${title}" (${slug})${featured ? " [featured]" : ""}`,
      files
    );
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin publish failed:", err);
    return NextResponse.json({ ok: false, error: "publish_failed" }, { status: 502 });
  }
}
