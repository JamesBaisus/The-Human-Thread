// Shared helpers for the admin API routes.
import fs from "fs";
import path from "path";
import { getFileText, isGithubConfigured, listArticleFiles } from "@/lib/github";

export function isAuthorized(request: Request): boolean {
  const password = request.headers.get("x-admin-password") ?? "";
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

export type ArticleSummary = {
  slug: string;
  name: string;
  role: string;
  title: string;
  category: string;
  date: string;
  featured: boolean;
};

const fm = (text: string, key: string) =>
  text.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, "m"))?.[1] ?? "";

export function parseArticleFile(filename: string, text: string) {
  const parts = text.split(/^---\s*$/m);
  const frontmatter = parts[1] ?? "";
  const body = parts.slice(2).join("---").trim();
  return {
    slug: fm(frontmatter, "slug") || filename.replace(/\.mdx?$/, ""),
    name: fm(frontmatter, "name"),
    role: fm(frontmatter, "role"),
    title: fm(frontmatter, "title"),
    deck: fm(frontmatter, "deck"),
    category: fm(frontmatter, "category"),
    accent: fm(frontmatter, "accent"),
    date: fm(frontmatter, "date"),
    featured: fm(frontmatter, "featured") === "true",
    body,
  };
}

/** Raw text of an article file — from GitHub when configured, else local disk (dry-run). */
export async function readArticleText(filename: string): Promise<string> {
  if (isGithubConfigured()) return getFileText(`content/articles/${filename}`);
  return fs.readFileSync(path.join(process.cwd(), "content", "articles", filename), "utf8");
}

/** Article filenames — from GitHub when configured, else local disk (dry-run). */
export async function readArticleList(): Promise<string[]> {
  if (isGithubConfigured()) return listArticleFiles();
  return fs
    .readdirSync(path.join(process.cwd(), "content", "articles"))
    .filter((n) => /\.mdx?$/.test(n));
}

export function buildMdx(f: {
  slug: string;
  name: string;
  role: string;
  category: string;
  title: string;
  deck: string;
  readTime: string;
  accent: string;
  featured: boolean;
  date: string;
  body: string;
}): string {
  return `---
slug: ${f.slug}
name: ${f.name}
role: ${f.role}
category: ${f.category}
title: ${f.title}
deck: "${f.deck.replace(/"/g, "'")}"
readTime: ${f.readTime}
accent: "${f.accent}"
cover: /articles/${f.slug}/cover.jpg
${f.featured ? "featured: true\n" : ""}date: ${f.date}
---

${f.body}
`;
}

/** MDX edits that un-feature every currently-featured article except `keepSlug`. */
export async function dethroneOthers(keepSlug: string): Promise<{ path: string; content: string }[]> {
  const out: { path: string; content: string }[] = [];
  for (const file of await readArticleList()) {
    if (file.replace(/\.mdx?$/, "") === keepSlug) continue;
    const text = await readArticleText(file);
    if (/^featured:\s*true\s*$/m.test(text)) {
      out.push({ path: `content/articles/${file}`, content: text.replace(/^featured:\s*true\s*$/m, "featured: false") });
    }
  }
  return out;
}
