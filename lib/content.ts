import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sizeOf from "image-size";
import sharp from "sharp";
import { site } from "@/content/site";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const POSTERS_FILE = path.join(ROOT, "content", "posters", "posters.json");
const EDITORIALS_FILE = path.join(ROOT, "content", "editorials", "editorials.json");
const EDIT_DIR = path.join(ROOT, "content", "edit");

/**
 * Optional layout hint, written after the caption in the MDX alt text:
 * `![A caption|right](/articles/x/01.jpg)`.
 * Solo media: wide (full-bleed breakout) | right | left (offset two-thirds) | inset (centered, quiet).
 * Paired media: flip reverses the diptych (large column on the right).
 * Three-up: triptych lays the set out as one staggered row of equal plates.
 * Without a hint, layouts rotate automatically, seeded per article.
 */
export type ImageLayout = "wide" | "right" | "left" | "inset" | "flip" | "triptych";

const IMAGE_LAYOUTS: ImageLayout[] = ["wide", "right", "left", "inset", "flip", "triptych"];

export type SectionImage = {
  src: string;
  /** Alt text in the MDX doubles as the printed caption. */
  caption: string;
  layout?: ImageLayout;
  /** Frame dimensions — for a video these come from its poster still. */
  width: number;
  height: number;
  blur: string;
  /**
   * Set when `src` is an `.mp4`: the still shown before playback, which lives
   * beside the clip under the same basename (`clip-01.mp4` -> `clip-01.jpg`).
   */
  poster?: string;
  /** True when the clip carries an audio track worth offering a sound toggle for. */
  sound?: boolean;
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
  hidden: boolean;
  date: string;
  sections: ArticleSection[];
};

/**
 * A THT Edit piece. Short-form entries that live only in the Edit deck on the
 * landing page and at /edit/<slug>: deliberately outside the article
 * catalogue, the category rows and the hero rotation.
 */
export type EditItem = {
  slug: string;
  /** Position in the deck, lowest first. */
  order: number;
  /**
   * True while the piece is dealt into the fanned deck on the landing page.
   * Turning it off moves it down to the THT Edit section, which is how the
   * deck stays a small hand as the archive grows. Named `inDeck` because
   * `deck` is already the standfirst on every piece.
   */
  inDeck: boolean;
  /** Small label above the title, free text rather than a site category. */
  kicker: string;
  title: string;
  deck: string;
  readTime: string;
  accent: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  coverBlur: string;
  hidden: boolean;
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

/** One editorial in the catalogue — its first slide is the card cover. */
export type CarouselFeature = { title: string; eyebrow?: string; slides: CarouselSlide[] };

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
    // A bare `---` opens the next section without printing a heading. Short
    // pieces need the break so their figures stay where they were written,
    // since a section renders all of its paragraphs before its images.
    if (/^-{3,}$/.test(line)) {
      current = { heading: "", paragraphs: [], images: [] };
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
          // A video borrows its frame and blur-up from the poster still beside it.
          const isVideo = /\.mp4$/i.test(im.src);
          const still = isVideo ? im.src.replace(/\.mp4$/i, ".jpg") : im.src;
          const dims = imageDims(still);
          return {
            ...im,
            width: dims.width,
            height: dims.height,
            blur: await blurFor(still),
            ...(isVideo ? { poster: still, sound: hasAudio(im.src) } : {}),
          };
        })
      ),
    }))
  );
}

/**
 * Cheap MP4 probe: true when a track handler box declares sound. Clips are
 * written with `+faststart`, so the moov atom sits in the first few KB.
 */
function hasAudio(publicPath: string): boolean {
  let fd: number | undefined;
  try {
    fd = fs.openSync(path.join(ROOT, "public", publicPath), "r");
    const buf = Buffer.alloc(64 * 1024);
    const head = buf.subarray(0, fs.readSync(fd, buf, 0, buf.length, 0));
    // hdlr box: size(4) "hdlr"(4) version+flags(4) pre_defined(4) handler_type(4)
    for (let i = head.indexOf("hdlr", 0, "latin1"); i >= 0; i = head.indexOf("hdlr", i + 4, "latin1")) {
      if (head.toString("latin1", i + 12, i + 16) === "soun") return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
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
        hidden: Boolean(data.hidden),
        date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
        sections: await enrichSections(parseSections(content)),
      } satisfies Article;
    })
  );
  // Articles marked `hidden: true` in frontmatter (admin panel hide toggle)
  // vanish from the whole public site: listings, ordering, and their URL.
  const visible = articles.filter((a) => !a.hidden);
  visible.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return visible;
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

async function loadEditItems(): Promise<EditItem[]> {
  if (!fs.existsSync(EDIT_DIR)) return [];
  const files = fs.readdirSync(EDIT_DIR).filter((f) => /\.mdx?$/.test(f));
  const items = await Promise.all(
    files.map(async (file) => {
      const raw = fs.readFileSync(path.join(EDIT_DIR, file), "utf8");
      const { data, content } = matter(raw);
      for (const field of ["order", "kicker", "title", "deck", "readTime", "accent", "cover", "date"]) {
        if (data[field] === undefined) throw new Error(`content/edit/${file}: missing frontmatter field "${field}"`);
      }
      const dims = imageDims(data.cover);
      return {
        slug: data.slug ?? file.replace(/\.mdx?$/, ""),
        order: Number(data.order),
        // absent means "in the deck" — a piece just added belongs at the top
        inDeck: data.inDeck === undefined ? true : Boolean(data.inDeck),
        kicker: String(data.kicker),
        title: String(data.title),
        deck: String(data.deck),
        readTime: String(data.readTime),
        accent: String(data.accent),
        cover: String(data.cover),
        coverWidth: dims.width,
        coverHeight: dims.height,
        coverBlur: await blurFor(String(data.cover)),
        hidden: Boolean(data.hidden),
        date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
        sections: await enrichSections(parseSections(content)),
      } satisfies EditItem;
    })
  );
  const visible = items.filter((i) => !i.hidden);
  visible.sort((a, b) => a.order - b.order);
  return visible;
}

let _edit: Promise<EditItem[]> | null = null;

/** The THT Edit deck, in card order. */
export function getEditItems(): Promise<EditItem[]> {
  return (_edit ??= loadEditItems());
}

export async function getEditItem(slug: string): Promise<EditItem | undefined> {
  return (await getEditItems()).find((i) => i.slug === slug);
}

/**
 * The hand dealt onto the landing page: the newest eligible pieces, capped so
 * the fan stays readable however far the archive grows. Everything else waits
 * in the THT Edit section, which always carries the full set.
 */
export async function getDeckEditItems(): Promise<EditItem[]> {
  return (await getEditItems()).filter((i) => i.inDeck).slice(0, site.editDeckSize);
}

/** The other pieces in the deck, for the foot of an Edit page. */
export async function getOtherEditItems(slug: string, count = 3): Promise<EditItem[]> {
  const all = await getEditItems();
  const idx = Math.max(0, all.findIndex((i) => i.slug === slug));
  return Array.from({ length: Math.min(count, all.length - 1) }, (_, k) => all[(idx + k + 1) % all.length]);
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

type EditorialRecord = {
  slug: string;
  title: string;
  eyebrow?: string;
  images: string[];
  /** Optional per-page labels, parallel to `images`. */
  labels?: string[];
  date: string;
};

async function loadEditorials(): Promise<CarouselFeature[]> {
  const raw = JSON.parse(fs.readFileSync(EDITORIALS_FILE, "utf8")) as EditorialRecord[];
  for (const e of raw) {
    for (const field of ["slug", "title", "images", "date"] as const) {
      if (!e[field] || (Array.isArray(e[field]) && e[field].length === 0)) {
        throw new Error(`content/editorials/editorials.json: editorial "${e.slug ?? "?"}" missing "${field}"`);
      }
    }
  }
  raw.sort((a, b) => (a.date < b.date ? 1 : -1));
  return Promise.all(
    raw.map(async (e) => ({
      title: e.title,
      eyebrow: e.eyebrow,
      slides: await Promise.all(
        e.images.map(async (src, i) => ({ src, label: e.labels?.[i] ?? "", blur: await blurFor(src) }))
      ),
    }))
  );
}

let _editorials: Promise<CarouselFeature[]> | null = null;

/** Editorial catalogue — each feature with its slides' blur placeholders. */
export function getCarouselFeatures(): Promise<CarouselFeature[]> {
  return (_editorials ??= loadEditorials());
}
