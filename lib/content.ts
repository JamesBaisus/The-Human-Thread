import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sizeOf from "image-size";
import { site } from "@/content/site";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const POSTERS_FILE = path.join(ROOT, "content", "posters", "posters.json");

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
  pullQuote?: string;
};

export type Article = {
  slug: string;
  name: string;
  role: string;
  category: string;
  title: string;
  deck: string;
  readTime: string;
  accent: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  featured: boolean;
  date: string;
  sections: ArticleSection[];
};

export type Poster = {
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

export type CategorySection = {
  name: string;
  anchor: string;
  articles: Article[];
};

export function catAnchor(category: string): string {
  return "cat-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Body = a series of `## heading` sections with paragraphs, optional `> pull quote` and `![alt](src)` image. */
function parseSections(body: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      current = { heading: line.slice(3).trim(), paragraphs: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { heading: "", paragraphs: [] };
      sections.push(current);
    }
    if (line.startsWith(">")) {
      const quote = line.replace(/^>\s?/, "");
      current.pullQuote = current.pullQuote ? current.pullQuote + " " + quote : quote;
      continue;
    }
    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      current.imageAlt = img[1];
      current.image = img[2];
      continue;
    }
    current.paragraphs.push(line);
  }
  return sections;
}

function imageDims(publicPath: string): { width: number; height: number } {
  try {
    const dims = sizeOf(path.join(ROOT, "public", publicPath));
    return { width: dims.width ?? 1200, height: dims.height ?? 1500 };
  } catch {
    return { width: 1200, height: 1500 };
  }
}

let _articles: Article[] | null = null;

/** All articles, newest first. Validates required fields at build time. */
export function getArticles(): Article[] {
  if (_articles) return _articles;
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => /\.mdx?$/.test(f));
  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = data.slug ?? file.replace(/\.mdx?$/, "");
    for (const field of ["name", "role", "category", "title", "deck", "readTime", "accent", "cover", "date"]) {
      if (!data[field]) throw new Error(`content/articles/${file}: missing frontmatter field "${field}"`);
    }
    if (!(site.categories as readonly string[]).includes(data.category)) {
      throw new Error(`content/articles/${file}: unknown category "${data.category}"`);
    }
    const dims = imageDims(data.cover);
    return {
      slug,
      name: String(data.name),
      role: String(data.role),
      category: String(data.category),
      title: String(data.title),
      deck: String(data.deck),
      readTime: String(data.readTime),
      accent: String(data.accent),
      cover: String(data.cover),
      coverWidth: dims.width,
      coverHeight: dims.height,
      featured: Boolean(data.featured),
      date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
      sections: parseSections(content),
    } satisfies Article;
  });
  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  _articles = articles;
  return articles;
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

/** The single featured article (drives the hero). Falls back to site.featuredSlug, then newest. */
export function getFeatured(): Article {
  const all = getArticles();
  return all.find((a) => a.featured) ?? all.find((a) => a.slug === site.featuredSlug) ?? all[0];
}

/** Latest N articles excluding the featured one (hero/reader sidebar). */
export function getLatest(count = 5): Article[] {
  const featured = getFeatured();
  return getArticles().filter((a) => a.slug !== featured.slug).slice(0, count);
}

/** Categories in site order, each with its articles newest-first. First article per category is the "Latest". */
export function getCategorySections(): CategorySection[] {
  const all = getArticles();
  return site.categories
    .map((name) => ({ name, anchor: catAnchor(name), articles: all.filter((a) => a.category === name) }))
    .filter((s) => s.articles.length > 0);
}

/** True when the article is the newest in its category (drives the "Latest" chip). */
export function isLatestInCategory(article: Article): boolean {
  const first = getArticles().find((a) => a.category === article.category);
  return first?.slug === article.slug;
}

/** Catalogue ordering: category order, then newest-first within category. */
export function getCatalogue(): Article[] {
  return getCategorySections().flatMap((s) => s.articles);
}

/** Next `count` articles after `slug` in catalogue order, with their catalogue position. */
export function getRelated(slug: string, count = 3): { no: string; article: Article }[] {
  const list = getCatalogue();
  const idx = Math.max(0, list.findIndex((a) => a.slug === slug));
  return Array.from({ length: count }, (_, k) => {
    const i = (idx + k + 1) % list.length;
    return { no: String(i + 1).padStart(2, "0"), article: list[i] };
  });
}

let _posters: Poster[] | null = null;

/** All posters, newest first. */
export function getPosters(): Poster[] {
  if (_posters) return _posters;
  const posters = JSON.parse(fs.readFileSync(POSTERS_FILE, "utf8")) as Poster[];
  for (const p of posters) {
    for (const field of ["slug", "category", "title", "images", "aspectRatio", "captions", "date"] as const) {
      if (!p[field] || (Array.isArray(p[field]) && p[field].length === 0)) {
        throw new Error(`content/posters/posters.json: poster "${p.slug ?? "?"}" missing "${field}"`);
      }
    }
  }
  posters.sort((a, b) => (a.date < b.date ? 1 : -1));
  _posters = posters;
  return posters;
}
