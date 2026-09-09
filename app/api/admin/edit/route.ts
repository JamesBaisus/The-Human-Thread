import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { commitFiles, getFileText, isGithubConfigured, listDir, type CommitFile } from "@/lib/github";
import { isAuthorized } from "@/lib/admin";

export const maxDuration = 60;

const DIR = "content/edit";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const fm = (text: string, key: string) =>
  text.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, "m"))?.[1] ?? "";

function parseEdit(filename: string, text: string) {
  return {
    slug: fm(text, "slug") || filename.replace(/\.mdx?$/, ""),
    order: Number(fm(text, "order") || 0),
    inDeck: fm(text, "inDeck") !== "false",
    kicker: fm(text, "kicker"),
    title: fm(text, "title"),
    deck: fm(text, "deck"),
    readTime: fm(text, "readTime"),
    accent: fm(text, "accent"),
    cover: fm(text, "cover"),
    date: fm(text, "date"),
  };
}

/** Local-disk fallback so the panel is testable before GitHub is wired up. */
async function listEditFiles(): Promise<string[]> {
  if (isGithubConfigured()) return (await listDir(DIR)).filter((f) => /\.mdx?$/.test(f));
  const fs = await import("fs");
  const path = await import("path");
  const dir = path.join(process.cwd(), DIR);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f)) : [];
}

async function readEdit(file: string): Promise<string> {
  if (isGithubConfigured()) return getFileText(`${DIR}/${file}`);
  const fs = await import("fs");
  const path = await import("path");
  return fs.readFileSync(path.join(process.cwd(), DIR, file), "utf8");
}

/**
 * Body arrives as plain text using the same conventions as an article:
 * blank-line paragraphs, optional `## Heading` and `> pull quote`. Pictures are
 * spread between the blocks, each separated by a `---` so the figures stay
 * where they land instead of collecting at the end of the piece.
 */
function buildBody(content: string, slug: string, photoCount: number): string {
  const blocks = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (photoCount > 0 && blocks.length > 0) {
    for (let i = photoCount - 1; i >= 0; i--) {
      const at = Math.min(blocks.length, Math.ceil(((i + 1) * blocks.length) / (photoCount + 1)));
      const img = `![](/edit/${slug}/${String(i + 1).padStart(2, "0")}.jpg)`;
      blocks.splice(at, 0, img, "---");
    }
  }
  return blocks.join("\n\n");
}

function buildMdx(f: {
  slug: string;
  order: number;
  inDeck: boolean;
  kicker: string;
  title: string;
  deck: string;
  readTime: string;
  accent: string;
  date: string;
  body: string;
}) {
  // titles routinely contain a colon, which bare YAML reads as a mapping
  const q = (v: string) => `"${v.replace(/"/g, "'")}"`;
  return `---
slug: ${f.slug}
order: ${f.order}
inDeck: ${f.inDeck}
kicker: ${f.kicker}
title: ${q(f.title)}
deck: ${q(f.deck)}
readTime: ${f.readTime}
accent: "${f.accent}"
cover: /edit/${f.slug}/cover.jpg
date: ${f.date}
---

${f.body}
`;
}

/** GET: every Edit piece, or one with ?slug= for editing. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  try {
    const files = await listEditFiles();
    if (slug) {
      const file = `${slug}.mdx`;
      if (!files.includes(file)) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      const text = await readEdit(file);
      const body = text.split(/^---\s*$/m).slice(2).join("---").trim();
      return NextResponse.json({ ok: true, edit: { ...parseEdit(file, text), body } });
    }
    const edits = await Promise.all(files.map(async (f) => parseEdit(f, await readEdit(f))));
    edits.sort((a, b) => a.order - b.order);
    return NextResponse.json({ ok: true, edits });
  } catch (err) {
    console.error("admin edit list failed:", err);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}

/** POST: add a piece. PUT with ?slug=: replace its text, and optionally its images. */
export async function POST(request: Request) {
  return write(request, "create");
}

export async function PUT(request: Request) {
  return write(request, "update");
}

async function write(request: Request, mode: "create" | "update") {
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
  const kicker = String(form.get("kicker") ?? "").trim().slice(0, 40) || "Culture";
  const deckIn = String(form.get("deck") ?? "").trim().slice(0, 300);
  const accentIn = String(form.get("accent") ?? "").trim();
  const inDeck = String(form.get("inDeck") ?? "true") !== "false";
  const content = String(form.get("content") ?? "").trim().slice(0, 30000);
  const cover = form.get("cover");
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
  const existingSlug = new URL(request.url).searchParams.get("slug");

  if (!title || !content) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (mode === "create" && !(cover instanceof File && cover.size > 0)) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (photos.length > 6) {
    return NextResponse.json({ ok: false, error: "too_many_photos" }, { status: 400 });
  }

  const slug = mode === "update" && existingSlug ? existingSlug : slugify(title);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  const accent = /^#[0-9a-fA-F]{6}$/.test(accentIn) ? accentIn : site.accent;
  const words = content.split(/\s+/).length;
  const readTime = `${Math.max(1, Math.round(words / 200))} min read`;
  const date = new Date().toISOString().slice(0, 10);
  const deck =
    deckIn || content.replace(/^[#>!-].*$/gm, "").trim().split(/(?<=[.!?])\s/)[0]?.slice(0, 200) || title;

  try {
    const files = await listEditFiles();
    const exists = files.includes(`${slug}.mdx`);
    if (mode === "create" && exists) {
      return NextResponse.json({ ok: false, error: "slug_exists", slug }, { status: 409 });
    }
    if (mode === "update" && !exists) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // New pieces go to the front of the deck; the rest shuffle down.
    const others = await Promise.all(
      files.filter((f) => f !== `${slug}.mdx`).map(async (f) => parseEdit(f, await readEdit(f)))
    );
    const order =
      mode === "update"
        ? parseEdit(`${slug}.mdx`, await readEdit(`${slug}.mdx`)).order
        : Math.min(0, ...others.map((o) => o.order)) - 1;

    const mdx = buildMdx({
      slug,
      order,
      inDeck,
      kicker,
      title,
      deck,
      readTime,
      accent,
      date,
      body: buildBody(content, slug, photos.length),
    });

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug, preview: mdx });
    }

    const commit: CommitFile[] = [{ path: `${DIR}/${slug}.mdx`, content: mdx }];
    if (cover instanceof File && cover.size > 0) {
      commit.push({ path: `public/edit/${slug}/cover.jpg`, content: Buffer.from(await cover.arrayBuffer()) });
    }
    for (let i = 0; i < photos.length; i++) {
      commit.push({
        path: `public/edit/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
        content: Buffer.from(await photos[i].arrayBuffer()),
      });
    }

    const sha = await commitFiles(
      `Admin: ${mode === "create" ? "add" : "update"} THT Edit "${title}" (${slug})`,
      commit
    );
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin edit write failed:", err);
    return NextResponse.json({ ok: false, error: "publish_failed" }, { status: 502 });
  }
}

/** PATCH { slug, inDeck } — moves a piece between the deck and the section. */
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { slug?: string; inDeck?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const inDeck = Boolean(body.inDeck);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    const file = `${slug}.mdx`;
    if (!(await listEditFiles()).includes(file)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const text = await readEdit(file);
    const updated = /^inDeck:/m.test(text)
      ? text.replace(/^inDeck:.*$/m, `inDeck: ${inDeck}`)
      : text.replace(/^(order:.*)$/m, `$1\ninDeck: ${inDeck}`);

    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug, inDeck });
    }
    const sha = await commitFiles(
      `Admin: move THT Edit ${slug} to the ${inDeck ? "deck" : "section"}`,
      [{ path: `${DIR}/${file}`, content: updated }]
    );
    return NextResponse.json({ ok: true, slug, inDeck, commit: sha });
  } catch (err) {
    console.error("admin edit patch failed:", err);
    return NextResponse.json({ ok: false, error: "patch_failed" }, { status: 502 });
  }
}

/** DELETE ?slug= — removes the piece and its images. */
export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }
  try {
    const file = `${slug}.mdx`;
    if (!(await listEditFiles()).includes(file)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (!isGithubConfigured()) {
      return NextResponse.json({ ok: true, demo: true, slug });
    }
    const images = await listDir(`public/edit/${slug}`).catch(() => []);
    const sha = await commitFiles(
      `Admin: remove THT Edit ${slug}`,
      [],
      [`${DIR}/${file}`, ...images.map((n) => `public/edit/${slug}/${n}`)]
    );
    return NextResponse.json({ ok: true, slug, commit: sha });
  } catch (err) {
    console.error("admin edit delete failed:", err);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 502 });
  }
}
