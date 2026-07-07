# Handoff: The Human Thread — Editorial Magazine Website

## Overview
**The Human Thread_AE** is an independent digital editorial magazine (based in the UAE, global vision). This handoff covers the full public website: a single-page, scroll-based magazine landing experience plus two detail views (article reader, inquire form). It presents featured covers, an editorial image carousel, article listings grouped by category, a poster/cover gallery with a lightbox viewer, an about section, a newsletter signup, and a submission ("Inquire") form.

The goal of the migration: **rebuild this as a Next.js app deployed on Vercel with a custom domain, structured so content (articles + posters) can be updated constantly** — content must live outside the component code as **in-repo MDX/JSON files** (decision made — do NOT use a headless CMS), never hard-coded into components.

> **Also read `CONTENT_WORKFLOW.md`** in this folder — it defines the exact content pipeline (folder conventions, MDX/JSON schemas, and the repeatable "drop a folder of Instagram screenshots → generate an entry → redeploy" procedure the owner uses). Scaffold the repo so that workflow works out of the box.

## About the Design Files
The file in this bundle (`The Human Thread.dc.html`) is a **design reference created in HTML** — a working prototype that shows the intended look, layout, animation, and behavior. **It is not production code to copy verbatim.** It is authored in a lightweight in-house component format (an `<x-dc>` template + a `class Component` logic class using React-style `state`/`renderVals`), so the *patterns* map directly to React, but the task is to **recreate the design idiomatically in Next.js/React** using that ecosystem's conventions (components, `next/image`, `next/font`, CSS Modules or Tailwind — builder's choice), not to port the custom runtime.

Everything renders with **inline styles** in the prototype; when recreating, consolidate into whatever styling system the Next.js project standardizes on. All measurements below are exact.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, animation timings, and interactions are all intentional and specified below. Recreate the UI faithfully. The only deliberately flexible part is *how* content is stored (see Content Architecture) — the visual result should match.

---

## Global System

### Design Tokens

**Colors**
- `--ink` `#1c1a17` — primary text, dark bands, footer, buttons
- `--ink-2` `#231f1b` — about body text
- `--body` `#3a352f` / `#4a463f` — secondary body text / labels
- `--muted` `#6d6a62` — eyebrow labels, meta
- `--muted-2` `#9a9a97` — faint meta, counts
- `--bg` `#ffffff` — page background
- `--bg-soft` `#f4f4f3` — carousel band, soft fills (dropzone, follow box)
- `--fill` `#eeeeee` — category chip background
- `--placeholder` `#ececec` — image placeholder background
- `--hairline` `#e3e3e3` — dividers, borders
- `--line-2` `#d6d6d6` — input underlines
- `--on-dark` `#f5f5f5` — text on dark bands
- **Accent** `#9a6b3f` (default) — a single themeable accent. Prototype exposes options: `#9a6b3f` (bronze), `#8f4b58` (plum), `#5c6b57` (olive), `#1c1a17` (near-black). Individual articles also carry their own `accent` hue (see article data) used in the reader.

**Typography** (Google Fonts — use `next/font/google`)
- **Playfair Display** (400/500/600/700/800/900, + italic) — masthead, all headlines, pull quotes, article body serif display. High-contrast editorial serif.
- **Newsreader** (300/400/500/600, + italic) — long-form reading / inputs.
- **Hanken Grotesk** (400/500/600/700) — all uppercase labels, tags, buttons, meta, nav. Letter-spacing on labels ~`.16em–.32em`, `text-transform:uppercase`.

**Spacing / sizing conventions**
- Content max-widths: `1280px` (main), `1360px` (poster gallery), `1000px`/`760px`/`680px` (about/newsletter columns).
- Section horizontal padding: `clamp(18px,4vw,54px)`.
- Section vertical rhythm: `clamp(30px,4vw,52px)` typical.
- Border radius: `2px` almost everywhere (chips, buttons, image frames). Circles for avatar/nav arrow buttons.
- Sticky header height ≈ 64px (used as scroll offset).

**Shadows** — minimal. Poster gallery cards and the featured cover use soft drop shadows; most surfaces are flat/borderless (the client explicitly wanted **no box outlines** — use fills or single underlines, not 4-sided borders).

### Fonts loading & links
Define default `a` / `a:hover` colors from the accent. Body reset: bg `#ffffff`, color `#1c1a17`, `-webkit-font-smoothing:antialiased`.

---

## Screens / Views

The site is a **single scrolling landing page** (`page === 'home'`) plus two full-view swaps rendered in place of the page: **Article Reader** (`page === 'article'`) and **Inquire** (`page === 'inquire'`). A poster **lightbox** overlays any view. In Next.js these map naturally to routes: `/` (landing), `/article/[slug]`, `/inquire`, with the poster lightbox as client state or `/posters/[slug]` intercepting route.

### 1. Header (sticky, all views)
- Sticky top, `z-index:60`, `background:rgba(255,255,255,.92)`, `backdrop-filter:blur(14px)`, bottom border `1px solid #e3e3e3`.
- Left: **burger button** (three 24×1.6px `#1c1a17` bars, 5px gap) + wordmark. Wordmark: "THE HUMAN THREAD" in Playfair Display 900, `clamp(19px,2vw,26px)`; sub-line "MAGAZINE · AE" in Hanken Grotesk 8.5px, `letter-spacing:.44em`, `#6d6a62`.
- Right: **search** icon button (magnifier SVG) + **Inquire** text button (Hanken Grotesk 10.5px 600 uppercase `.16em`, borderless, hover opacity .5).

### 2. Nav Drawer (slide-in)
- Opens from burger. Full-screen overlay `rgba(20,18,16,.42)` + `backdrop-filter:blur(2px)`, `z-index:150`. Click overlay to close.
- Left panel `width:min(330px,84vw)`, white, `box-shadow:24px 0 60px -30px rgba(20,18,16,.5)`, slides in via `@keyframes drawerin` (translateX(-100%)→0, `.38s cubic-bezier(.2,.75,.25,1)`).
- Header row: mini wordmark + `×` close button.
- Links (Playfair Display 500, 26px, each with bottom hairline, hover → accent color + `padding-left:9px`): **Home, Fashion, Art, Human Stories, Posters, About**. (Category links are generated only for categories that have articles.)
- **Behavior:** each link smooth-scrolls to its section on the landing page. If currently on a detail view (article/inquire), it first returns to the landing page, then scrolls. See Interactions → Scroll nav.

### 3. Landing page — section order (top to bottom)
1. **Hero** (`#top` = scroll to 0)
2. **Editorial Carousel**
3. **"Featured in this issue" marquee**
4. **Posters gallery** (`id="posters"`)
5. **Category/article sections** (`id="cat-<slug>"`, one per category)
6. **About** (`id="about"`)
7. **Dark band** feature promo
8. **Newsletter** signup

#### 3a. Hero
- Two-column grid: `1fr 300px` (`.homehero`), gap `clamp(24px,3.4vw,64px)`, `align-items:start`. Collapses per Responsive.
- **Left — featured cover** (`.herofeat`, clickable → opens featured article): eyebrow "FEATURED" (Hanken Grotesk, accent) with a hairline rule; then the cover image. **Image renders at its natural aspect ratio** (`width:100%;max-width:330px;height:auto` — do NOT force an aspect ratio or object-fit crop; covers vary in ratio). Below: article title (Playfair Display 500, `clamp(...)`, `max-width:14ch`).
- **Right — "The Latest" sidebar** (`.sidesticky`, `position:sticky;top:120px`): heading "The Latest" (Playfair Display 500, 24px), then a list of latest articles — each a small row: thumbnail (left) + category label + title. Clicking opens that article.

#### 3b. Editorial Carousel (`data-screen-label="Editorial Carousel"`)
- Full-width band, `background:#f4f4f3`, top+bottom `1px solid #e3e3e3`, padding `clamp(40px,5.5vw,84px) 0`. Hover pauses autoplay (`onMouseEnter`/`Leave`).
- Header row: eyebrow "The Editorial · Issue 03" (accent), title "Kateryna Migush" (Playfair Display, `clamp(32px,4.6vw,60px)`), italic subhead; right side: counter `NN / NN` + round prev/next buttons (46px circles, `background:#e3e3e3`, arrow glyphs, hover → dark).
- **Coverflow stage** (`.carstage`, height `clamp(400px,52vw,640px)`): 5 slides positioned absolutely, centered. Active slide scale 1, opacity 1, soft shadow; ±1 neighbors scale .84 / opacity .55; ±2 scale .7 / opacity .24; blur 1.2px on non-active. Transition `.7s cubic-bezier(.22,.61,.36,1)`. Slides use `aspectRatio:1236/1600`. Click a side slide to make it active.
- Below: caption (italic Playfair, current slide label) + dot indicators (active dot elongates to 26px, accent).
- **Autoplay:** advance +1 every 5200ms, only while on landing page and not hovered.
- Slides (image + label), in order:
  1. `uploads/carousel/1.jpg` — "The Opening"
  2. `uploads/carousel/2.jpg` — "A Quiet Kind of Becoming"
  3. `uploads/carousel/3.jpg` — "The Power of Modesty"
  4. `uploads/carousel/4.jpg` — "Behind the Image"
  5. `uploads/carousel/5.jpg` — "Beauty From Within"

#### 3c. Marquee
- "Featured in this issue" centered eyebrow, then an infinite horizontal marquee of contributor names (italic Playfair) separated by small **round dots** drawn in CSS (`.mq-dot` = a 6px accent-colored circle, not a glyph character — do not rely on a "•"/"✦" font glyph, which renders as a tofu box in Hanken Grotesk). Marquee pauses on hover. Bottom border hairline.

#### 3d. Posters gallery (`id="posters"`)
- Header: eyebrow "The cover gallery", big "Posters" heading (Playfair, `clamp(40px,7vw,92px)`), intro paragraph right-aligned.
- **Masonry grid** (`.iggrid`, CSS `column-count`: 4 default → 3 ≤1100px → 2 ≤760px). Each poster is a card (`.gcard`) with the cover image (per-poster `aspectRatio`) and a hover overlay (`.gover`) showing category chip + title in white.
- Click a poster → opens the **Poster Lightbox**.

#### 3e. Category/article sections (one per category with articles)
- Each `<section id="cat-<slug>">` (slug = lowercased category, non-alphanumerics → `-`; e.g. "Human Stories" → `cat-human-stories`), `scroll-margin-top:80px`.
- Header row: category name (Playfair, `clamp(30px,4vw,54px)`) + count ("N stories") + **"View all"** link (→ full catalogue filtered to that category; see Article Catalogue note).
- Grid of article cards: `repeat(auto-fill,minmax(min(258px,100%),1fr))`, gap `clamp(20px,2.2vw,34px)`.
- **Article card** (`.card`, clickable → article reader): cover image in `aspect-ratio:4/5` frame, `object-fit:cover;object-position:center top`, radius 2px; then a row of chips — a **"Latest" chip** (dark `#1c1a17`, white text) shown only on the first (latest) card in each category, followed by the **category chip** (`#eeeeee` bg) and a short accent rule; then title (Playfair 500, `clamp(22px,2.3vw,28px)`), an italic byline "Name — Role" (accent), and a deck paragraph (14px, `#6d6a62`).

#### 3f. About (`id="about"`)
- Centered eyebrow "About the publication"; large statement headline with italic emphasis: *"A magazine for what is **seen**, and what deserves to be **understood**."* (Playfair, `clamp(34px,5.2vw,70px)`).
- Body: `aboutBody` paragraphs (see Content) in a 680px column, `clamp(17px,1.5vw,20px)`, line-height 1.72, color `#231f1b`.
- **"What we stand for"** on a dark band (`#1c1a17`, `#f5f5f5` text): 4-column grid (`.valuegrid`; → 2 cols ≤820px, 1 col ≤480px). Each value: big number (Playfair 34px, accent) + title (Playfair 600, 24px) + text, with a top hairline `rgba(245,245,245,.28)`.

#### 3g. Dark band feature promo
- `.darkband`, clickable → opens the featured/"cover band" article. `background:#1c1a17`, `#f5f5f5`. Giant parallax "13" numeral watermark at `rgba(245,245,245,.055)` (has `data-parallax="0.12"`). Content: eyebrow "kicker · category" (accent), huge headline (Playfair, `clamp(38px,6vw,88px)`, `max-width:16ch`), italic deck, and a "Read the feature →" pseudo-button (borderless).

#### 3h. Newsletter
- Centered 760px column: eyebrow "The newsletter" (accent), "Join the thread." (Playfair, `clamp(30px,4.4vw,50px)`), supporting copy, and an inline form: email input (underline-only, Newsreader 16px) + "Join" button (dark pill, radius 2px). On submit → button label becomes "Joined ✓" (no backend in prototype).

### 4. Article Reader (`page === 'article'`, `data-screen-label="Article"`)
- Full-view swap. Top meta row (category · read-time) with a hairline under it.
- Two-column: main article body + a right sidebar ("The Latest" list, same as hero sidebar; also a small search/follow block).
- Body renders the article's `sections[]`: each has a heading `h` (Playfair) and paragraphs; some sections carry an image (`figure`, radius 2px) and/or a **pull quote** (`blockquote`, `border-left:2px solid <article.accent>`, italic Playfair).
- Uses the article's own `accent` color for rules/quotes.
- "Back" / logo returns to the landing page.

### 5. Inquire (`page === 'inquire'`, `data-screen-label="Inquire"`)
- "← Back to the issue" link, eyebrow "Submit to the issue", giant "Inquire" title (Playfair, `clamp(48px,8vw,104px)`), italic intro.
- Form (all fields borderless — underline or soft-fill only):
  - **Magazine images**: drag/drop file area (`.drop`) — soft `#f4f4f3` fill (no dashed border), icon, label "{count} selected" state, hint "JPG · PNG · up to 20MB each", hidden multi `file` input.
  - **Article content**: textarea (`border-bottom:1px solid #d6d6d6` only), 7 rows.
  - **Your name** / **Email**: two-up row (`.formrow`, collapses to 1 col ≤620px), underline inputs.
  - Footer row: submit "Send inquiry" (dark pill).
- On submit → success state: italic "Thank you — your thread is with us." + copy + "Back to the issue" button. (No backend in prototype — wire to real email/endpoint in production.)

### 6. Poster Lightbox (overlay, any view)
- Full-screen overlay (`.ov`, dark), `z-index` above header. Left: image stage with prev/next arrows (`.igarrow`) and a position counter `n / N` (top-right pill) when the poster has multiple images. Right: dark info panel (`#141414`, `#ededed`) with handle `thehumanthread_ae`, category, title, the caption paragraphs, hashtags, a note line, and time-ago. Click outside / close to dismiss. Multi-image posters swipe within the same poster.

---

## Interactions & Behavior

### Scroll navigation (core behavior)
`scrollToSection(id)`:
- Closes the drawer.
- If not on the landing page, switch to it first (`page='home'`), then after ~80ms begin scrolling.
- Target Y = element's document top − 64 (header offset); `id === 'top'` scrolls to 0.
- **Convergence loop:** because hero/carousel images load after first paint and shift layout, it re-computes the target and re-issues `scrollTo({behavior:'smooth'})` every ~90ms until the target Y is stable for 3 consecutive checks (or ~44 tries). This guarantees it lands on the section even as images finish loading. **Reproduce this — a single scroll fires too early and lands short.** In Next.js, using `next/image` with known width/height (reserved space) largely removes the layout shift and simplifies this to a normal smooth scroll + `scroll-margin-top`.

### Reveal-on-scroll animations
- Elements with `data-reveal` (values: default fade-up, `left`, `scale`) start hidden and animate in when scrolled into view via IntersectionObserver. Optional `data-reveal-delay` (ms) staggers them. Respect `prefers-reduced-motion` (disable). Grids can stagger children via `data-stagger`.

### Parallax
- `data-parallax="<factor>"` elements (e.g. the "13" watermark) translate on scroll relative to a base transform.

### Carousel
- Autoplay +1 / 5200ms, paused on hover and when not on landing. Prev/next step; clicking a side slide sets it active; dots jump. Indices wrap.

### Header
- Sticky, translucent. (Prototype has hooks for hide-on-scroll via `headerRef`; not essential.)

### Hover states (specify in build)
- Nav drawer links → accent + slight left pad.
- Carousel arrows → invert to dark.
- "View all" / band button → arrow nudge.
- Poster cards → overlay fades in.
- Inquire text button → opacity .5.

### Responsive
- `.homehero`: `1fr 300px` → `1fr 260px` ≤1080px → single column ≤780px (sidebar becomes static, not sticky).
- Card grids use `minmax(min(258px,100%),1fr)` so they never overflow on narrow screens.
- `.iggrid` masonry columns: 4 → 3 (≤1100) → 2 (≤760).
- `.valuegrid`: 4 → 2 (≤820) → 1 (≤480).
- `.formrow`: 2 → 1 (≤620).
- `.carstage` height steps down at ≤780 and ≤480.
- Type/padding use `clamp()` throughout — fluid between breakpoints.

## State Management
Prototype state (recreate as React state / URL routes as appropriate):
- `page`: `'home' | 'article' | 'articles' | 'about'(now a section) | 'inquire' | 'posters'(now a section)` — in Next.js prefer routes: `/`, `/article/[slug]`, `/catalogue?filter=`, `/inquire`.
- `story` (active article index), `filter` (catalogue category), `viewer` (active poster index or −1), `slide` (poster lightbox image index), `car` (carousel active index), `navOpen` (drawer), form fields (`inqName/inqEmail/inqContent/inqFiles`), `email`, `subbed`, `inqSent`.
- No data fetching in the prototype — all content is in-file. **In production, fetch/import article + poster content from the content layer (see below).**

## Content Architecture (important for "constant updates")
Do **not** hard-code articles/posters into components. Model them as data:

**Article** fields: `slug`, `name` (subject), `role`, `category` (one of: Fashion, Culture, Art, Human Stories, Lifestyle, Features), `title`, `deck` (short summary), `readTime`, `accent` (hex), `cover` (image), `sections[]` where each section = `{ heading, paragraphs[], image?, pullQuote? }`. Ordering within a category is explicit (a per-category ordered list of subject names); the first item in each category shows the **"Latest"** chip. One article is flagged **featured** (drives the hero + defaults to "Caroline Labouchere").

**Poster** fields: `slug`, `category`, `title`, `images[]` (1–N), `aspectRatio` (e.g. `3/4`, `4/3`, `3/2`, `1/1`), `captions[]` (paragraphs), `hashtags`, `note`, `time`, `handle`. Newest posters appear first.

Recommended for constant updates: **MDX/JSON content files in the repo** (edit → Git push → Vercel auto-deploys) *or* a **headless CMS** (Sanity/Contentful) if non-technical editors will publish. Either way the components read from this layer.

## Assets
All in `uploads/` in this project (copied into this handoff under `assets/` — see Files). Move to `/public` in Next.js and serve via `next/image`.
- **Carousel:** `uploads/carousel/1.jpg … 5.jpg` (Kateryna Migush editorial spread).
- **Article covers:** `uploads/MagazineArticles/MagazineArticle1..10/cover.jpg`.
- **Article body images:** additional numbered images inside some `MagazineArticleN/` folders (see the article `sections` in the prototype for which are referenced).
- **Posters:** `uploads/Posters/Poster1..5/` — each folder holds one or more `Screenshot ….png` / `poster.png` images. The prototype's `P` array (in the logic class) lists the exact filename order per poster, plus each poster's category, title, caption paragraphs, hashtags, and note. **Use that array as the source of truth for poster content.**
- **Fonts:** Google Fonts — Playfair Display, Newsreader, Hanken Grotesk.
- Icons are inline SVG (search magnifier, nav arrows, upload/image glyph) — recreate or use an icon set.

### Exact copy — About body & values
`aboutBody` (5 paragraphs) and the 4 `values` (Human first / Slow media / Regional pride / Beauty with meaning) are in the prototype logic class near the end — copy verbatim.

## Files
- `The Human Thread.dc.html` — the complete high-fidelity design reference (template + logic class with all article & poster data, copy, colors, and behaviors). **This is the authoritative spec for content and interactions.**
- `assets/` — the images used by the design (carousel, article covers/body, posters).

### How to read the prototype
- The markup between `<x-dc>…</x-dc>` is the template. `{{ x }}` are data holes; `<sc-for>`/`<sc-if>` are loops/conditionals; `data-screen-label` marks major views.
- The `class Component extends DCLogic` block is the logic: `articles()` returns the full article dataset (with `sections`, `accent`, etc.), the `P` array in `renderVals()` holds all poster data, and `renderVals()` returns everything the template binds to. `scrollToSection`, carousel, and viewer methods define the interactions described above.
