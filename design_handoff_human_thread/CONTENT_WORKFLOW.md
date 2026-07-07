# CONTENT_WORKFLOW.md — How content gets added & the site stays updated

> **Read this together with `README.md`.** The README is the visual/interaction spec. This file defines the **content pipeline**: how new articles and posters are added and deployed. Claude Code should scaffold the Next.js project so this workflow works out of the box.

## The owner's workflow (design the repo around this)
The site owner adds content by **dropping a folder of Instagram screenshots + a cover/hero image**, then asking Claude Code to extract it into a content entry, then redeploying via Git. There is **no CMS and no dashboard** — Claude Code *is* the editor. Everything lives in the repo as MDX/JSON + images in `/public`, so a `git push` triggers a Vercel redeploy and the change is live in ~1 minute.

**Do NOT** integrate a headless CMS, database, or admin UI. Keep content as plain files in the repo.

---

## Repository content layout (create this structure)
```
content/
  _inbox/                     # drop zone — raw folders the owner adds; processed then emptied
    <slug>/                   # e.g. safa-tayebi/  — screenshots + cover image go here
  articles/
    <slug>.mdx               # one file per article (frontmatter + body)
  posters/
    posters.json             # OR one <slug>.json per poster (either is fine, be consistent)
  site.ts (or site.json)      # global copy: aboutBody[], values[], carousel[], marquee names, featured slug, accent
public/
  articles/<slug>/           # processed, optimized images for that article (cover.jpg, 01.jpg, …)
  posters/<slug>/            # processed images for that poster (01.png, 02.png, …)
  carousel/                  # editorial carousel images
```

Provide a helper (e.g. `lib/content.ts`) that reads and validates these files at build time and feeds the components. Use `next/image` for every image (reserve width/height to avoid layout shift — this also lets the scroll-nav be a simple smooth scroll + `scroll-margin-top` instead of the convergence loop the prototype needs).

---

## Content schemas

### Article — `content/articles/<slug>.mdx`
Frontmatter (YAML) + MDX body. Fields:
```yaml
---
slug: caroline-labouchere         # url + folder name (kebab-case)
name: Caroline Labouchere          # the subject/person
role: Model & entrepreneur         # short role/byline
category: Human Stories            # one of: Fashion | Culture | Art | Human Stories | Lifestyle | Features
title: Grey Was Never The End      # article headline
deck: A short one-sentence summary shown on cards.
readTime: 6 min read
accent: "#8f4b58"                  # per-article accent hex (used for rules/pull-quotes in the reader)
cover: /articles/caroline-labouchere/cover.jpg
featured: true                     # exactly ONE article should be featured (drives the hero)
date: 2026-07-07                    # used for ordering / "Latest"
---

## Section heading
Body paragraph…

> A pull quote goes here.          # blockquote → styled pull quote

![alt](/articles/caroline-labouchere/01.jpg)   # optional inline image
```
- Body is a series of **sections**: an `h2` heading followed by paragraphs, with optional images and blockquotes (pull quotes). Match the reader layout in README §4.
- **Category ordering & "Latest":** within each category, articles are shown newest-first (by `date`, or an explicit order list in `site` config). The first/newest article in each category automatically gets the **"Latest"** chip. Don't hard-code the flag — derive it.

### Poster — `content/posters/posters.json` (array) or per-file
```json
{
  "slug": "into-the-abyss",
  "category": "Fashion",
  "title": "Into the Abyss",
  "images": ["/posters/into-the-abyss/01.png", "/posters/into-the-abyss/02.png"],
  "aspectRatio": "3 / 4",
  "captions": [
    "First caption paragraph…",
    "Second caption paragraph…"
  ],
  "hashtags": "#schiaparelli #hautecouture #danielroseberry",
  "note": "One-line editor's note.",
  "time": "3d",
  "handle": "thehumanthread_ae",
  "date": "2026-07-07"
}
```
- Posters render newest-first in the masonry gallery (by `date`).
- `aspectRatio` should match the real proportions of the first image (e.g. `3 / 4`, `4 / 3`, `3 / 2`, `1 / 1`) so the masonry stays clean.

### Global site copy — `content/site.ts`
- `aboutBody: string[]` and `values: {no,title,text}[]` — copy them **verbatim** from the prototype logic class (`renderVals()` near the end of `The Human Thread.dc.html`).
- `carousel: {src,label}[]` — the 5 editorial slides.
- `marqueeNames: string[]` — contributor names for the marquee.
- `featuredSlug` and `accent` (default `#9a6b3f`).

---

## The repeatable "add content" procedure (owner + Claude Code)

**Owner does:**
1. Create `content/_inbox/<slug>/` (e.g. `content/_inbox/safa-tayebi/`).
2. Put the Instagram screenshots (the caption/text) **and** the cover/hero image in that folder.
3. Ask Claude Code (prompt below).
4. Review, then `git add -A && git commit && git push` → Vercel redeploys.

**Claude Code does (define this behavior):**
1. Read every image in `content/_inbox/<slug>/`. **Extract the written content** from the screenshots (title, subject name, role, body text, hashtags, any note). Identify the **cover/magazine image** vs. supporting images.
2. Decide **article vs poster**:
   - Long-form profile of a person/subject with a magazine cover → **article** (`content/articles/<slug>.mdx`).
   - An IG post / editorial moment (exhibition, object, place, culture) with 1–N images and a caption → **poster** (`content/posters`).
3. Pick the **category** from the allowed list; set `accent` sensibly (articles); set `date` = today.
4. **Optimize + move images** into `public/articles/<slug>/` or `public/posters/<slug>/` with clean names (`cover.jpg`, `01.jpg`…). Set poster `aspectRatio` from the first image's real dimensions.
5. Write the MDX/JSON entry using the schema above. Break article body into logical sections with headings; promote 1–2 strong lines into pull quotes.
6. Leave category ordering/"Latest" to derive automatically from `date`.
7. **Empty/clear** the processed `_inbox/<slug>/` folder (images now live in `/public`).
8. Report what was created so the owner can review before pushing.

### Copy-paste prompt the owner uses each time
> "I've added a folder at `content/_inbox/<slug>/` with Instagram screenshots and a cover image. Read the images, extract the content, and create a new **[article | poster]** entry following `design_handoff_human_thread/CONTENT_WORKFLOW.md`: write the MDX/JSON with the right category and metadata, move and optimize the images into `/public`, set the aspect ratio, and clear the inbox folder. Then tell me what you created so I can review and push."

---

## Deployment (Vercel)
- Connect the GitHub repo to Vercel once. Every push to the main branch auto-builds and deploys.
- Add the **custom domain** in Vercel → Project → Settings → Domains, then set the DNS records Vercel shows at your registrar. SSL is automatic.
- No environment variables or secrets are needed for content (it's all in-repo). If the Inquire form is wired to a real email/endpoint later, that key would be the only env var.

## Guardrails for Claude Code
- **Never** hard-code articles/posters inside React components — always read from `content/`.
- Keep the **visual design faithful** to `README.md` (tokens, type, spacing, borderless styling, animations).
- One styling system for the whole app (ask the owner: Tailwind or CSS Modules) — don't mix.
- Use `next/image` + `next/font/google` (Playfair Display, Newsreader, Hanken Grotesk).
- Preserve the **single-page scroll** with anchor sections (`#top`, `#posters`, `#cat-<slug>`, `#about`) and the burger drawer that scrolls to them; article reader and inquire as their own routes.
