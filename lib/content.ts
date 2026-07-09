import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sizeOf from "image-size";
import sharp from "sharp";
import { site } from "@/content/site";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const POSTERS_FILE = path.join(ROOT, "content", "posters", "posters.json");

/**
 * Optional layout hint, written after the caption in the MDX alt text:
 * `![A caption|right](/articles/x/01.jpg)`.
 * Solo images: wide (full-bleed breakout) | right | left (offset two-thirds) | inset (centered, quiet).
 * Paired images: flip reverses the diptych (large column on the right).
 * Without a hint, layouts rotate automatically, seeded per article.
 */
export type ImageLayout = "wide" | "right" | "left" | "inset" | "flip";

const IMAGE_LAYOUTS: ImageLayout[] = ["wide", "right", "left", "inset", "flip"];

export type SectionImage = {
  src: string;
  /** Alt text in the MDX doubles as the printed caption. */
  caption: string;
  layout?: ImageLayout;
  width: number;
  height: number;
  blur: string;
};

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  images: SectionImage[];
  pullQuote?: string;
};

type RawSection = Omit<ArticleSection, "images"> & {
  images: { src: string; caption: string; layout?: ImageLayout }[];
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
  /** Tiny inline blur-up placeholder (data URL), generated at build time. */
  coverBlur: string;
  featured: boolean;
  date: string;
  sections: ArticleSection[];
};

export type Poster = {
  slug: string;
  category: string;
  title: string;
  images: string[];
  /** Blur-up placeholders, parallel to `images`. */
  blurs: string[];
  aspectRatio: string;
  captions: string[];
  hashtags: string;
  note: string;
  time: string;
  handle: string;
  date: string;
};

export type CarouselSlide = { src: string; label: string; blur: string };

export type CategorySection = {
  name: string;
  anchor: string;
  articles: Article[];
};

export function catAnchor(category: string): string {
  return "cat-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// 1×1 grey gif, used if a blur thumbnail can't be generated.
const FALLBACK_BLUR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAOzq6AAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

const blurCache = new Map<string, Promise<string>>();

/** Tiny (16px) blurred webp of a /public image, inlined as a data URL. */
function blurFor(publicPath: string): Promise<string> {
  let cached = blurCache.get(publicPath);
  if (!cached) {
    cached = sharp(path.join(ROOT, "public", publicPath))
      .resize(16, 16, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer()
      .then((buf) => `data:image/webp;base64,${buf.toString("base64")}`)
      .catch(() => FALLBACK_BLUR);
    blurCache.set(publicPath, cached);
  }
  return cached;
}

/** Body = a series of `## heading` sections with paragraphs, optional `> pull quote` and `![caption](src)` images. */
function parseSections(body: string): RawSection[] {
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      current = { heading: line.slice(3).trim(), paragraphs: [], images: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { heading: "", paragraphs: [], images: [] };
      sections.push(current);
    }
    if (line.startsWith(">")) {
      const quote = line.replace(/^>\s?/, "");
      current.pullQuote = current.pullQuote ? current.pullQuote + " " + quote : quote;
      continue;
    }
    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      let caption = img[1];
      let layout: ImageLayout | undefined;
      const bar = caption.lastIndexOf("|");
      if (bar >= 0) {
        const hint = caption.slice(bar + 1).trim() as ImageLayout;
        if (IMAGE_LAYOUTS.includes(hint)) {
          layout = hint;
          caption = caption.slice(0, bar).trim();
        }
      }
      current.images.push({ caption, layout, src: img[2] });
      continue;
    }
    current.paragraphs.push(line);
  }
  return sections;
}

async function enrichSections(sections: RawSection[]): Promise<ArticleSection[]> {
  return Promise.all(
    sections.map(async (s) => ({
      ...s,
      images: await Promise.all(
        s.images.map(async (im) => {
          const dims = imageDims(im.src);
          return { ...im, width: dims.width, height: dims.height, blur: await blurFor(im.src) };
        })
      ),
    }))
  );
}

function imageDims(publicPath: string): { width: number; height: number } {
  try {
    const dims = sizeOf(path.join(ROOT, "public", publicPath));
    return { width: dims.width ?? 1200, height: dims.height ?? 1500 };
  } catch {
    return { width: 1200, height: 1500 };
  }
}

async function loadArticles(): Promise<Article[]> {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => /\.mdx?$/.test(f));
  const articles = await Promise.all(
    files.map(async (file) => {
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
        coverBlur: await blurFor(String(data.cover)),
        featured: Boolean(data.featured),
        date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
        sections: await enrichSections(parseSections(content)),
      } satisfies Article;
    })
  );
  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return articles;
}

let _articles: Promise<Article[]> | null = null;

/** All articles, newest first. Validates required fields at build time. */
export function getArticles(): Promise<Article[]> {
  return (_articles ??= loadArticles());
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.slug === slug);
}

/** The single featured article (drives the hero). Falls back to site.featuredSlug, then newest. */
export async function getFeatured(): Promise<Article> {
  const all = await getArticles();
  return all.find((a) => a.featured) ?? all.find((a) => a.slug === site.featuredSlug) ?? all[0];
}

/** Latest N articles excluding the featured one (hero/reader sidebar). */
export async function getLatest(count = 5): Promise<Article[]> {
  const featured = await getFeatured();
  return (await getArticles()).filter((a) => a.slug !== featured.slug).slice(0, count);
}

/** Categories in site order, each with its articles newest-first. First article per category is the "Latest". */
export async function getCategorySections(): Promise<CategorySection[]> {
  const all = await getArticles();
  return site.categories
    .map((name) => ({ name, anchor: catAnchor(name), articles: all.filter((a) => a.category === name) }))
    .filter((s) => s.articles.length > 0);
}

/** True when the article is the newest in its category (drives the "Latest" chip). */
export async function isLatestInCategory(article: Article): Promise<boolean> {
  const first = (await getArticles()).find((a) => a.category === article.category);
  return first?.slug === article.slug;
}

/** Catalogue ordering: category order, then newest-first within category. */
export async function getCatalogue(): Promise<Article[]> {
  return (await getCategorySections()).flatMap((s) => s.articles);
}

/** Next `count` articles after `slug` in catalogue order, with their catalogue position. */
export async function getRelated(slug: string, count = 3): Promise<{ no: string; article: Article }[]> {
  const list = await getCatalogue();
  const idx = Math.max(0, list.findIndex((a) => a.slug === slug));
  return Array.from({ length: count }, (_, k) => {
    const i = (idx + k + 1) % list.length;
    return { no: String(i + 1).padStart(2, "0"), article: list[i] };
  });
}

async function loadPosters(): Promise<Poster[]> {
  const raw = JSON.parse(fs.readFileSync(POSTERS_FILE, "utf8")) as Omit<Poster, "blurs">[];
  for (const p of raw) {
    // captions/hashtags/note are optional — self-captioned poster artwork needs none
    for (const field of ["slug", "category", "title", "images", "aspectRatio", "date"] as const) {
      if (!p[field] || (Array.isArray(p[field]) && p[field].length === 0)) {
        throw new Error(`content/posters/posters.json: poster "${p.slug ?? "?"}" missing "${field}"`);
      }
    }
    p.captions ??= [];
  }
  const posters = await Promise.all(
    raw.map(async (p) => ({ ...p, blurs: await Promise.all(p.images.map(blurFor)) }))
  );
  posters.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posters;
}

let _posters: Promise<Poster[]> | null = null;

/** All posters, newest first. */
export function getPosters(): Promise<Poster[]> {
  return (_posters ??= loadPosters());
}

/** Editorial carousel slides with blur placeholders. */
export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  return Promise.all(site.carousel.slides.map(async (s) => ({ ...s, blur: await blurFor(s.src) })));
}
