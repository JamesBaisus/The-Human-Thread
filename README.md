# The Human Thread — Magazine · AE

Independent digital editorial magazine (UAE, global vision), built with **Next.js (App Router) + Tailwind CSS**.
All content lives **in the repo** as MDX/JSON — no CMS, no database.

## Stack

- Next.js 15 (App Router, static generation) · React 19 · TypeScript
- Tailwind CSS v4 (tokens in `app/globals.css`)
- `next/font/google`: Playfair Display, Newsreader, Hanken Grotesk
- `next/image` for all imagery

## Routes

| Route | View |
| --- | --- |
| `/` | Single-page landing: hero, editorial carousel, marquee, posters gallery (+lightbox), category sections (`#cat-<slug>`), about (`#about`), dark feature band, newsletter |
| `/article/[slug]` | Article reader |
| `/catalogue?filter=<category>` | Full article catalogue with category chips |
| `/inquire` | Submission form |

## Content

```
content/
  _inbox/            # drop zone for new raw content (screenshots + cover)
  articles/<slug>.mdx  # frontmatter + "## heading / paragraphs / > pull quote" sections
  posters/posters.json # poster entries, newest first by date
  site.ts              # global copy: about, values, carousel, marquee, featured slug, accent
public/
  articles/<slug>/cover.jpg
  posters/<slug>/01.png …
  carousel/1..5.jpg
```

`lib/content.ts` reads and validates everything at build time. Ordering and the
per-category **"Latest"** chip are derived from frontmatter `date` — never hard-coded.
Exactly one article has `featured: true` (drives the hero).

## Adding content

See **`design_handoff_human_thread/CONTENT_WORKFLOW.md`** for the full pipeline.
Short version: drop a folder in `content/_inbox/<slug>/` with screenshots + a cover,
ask Claude Code to extract it into an article/poster entry, review, then
`git push` — Vercel redeploys automatically.

## Develop

```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # static production build
npm run optimize:images  # resize/recompress everything in /public (run after adding images)
```

`optimize:images` caps images at 1600px, recompresses JPEGs, and converts
photographic PNGs (e.g. Instagram screenshots) to JPEG — if it converts a PNG,
update the matching path in `content/` (it prints the list). Keep running it as
part of the inbox workflow so `/public` stays lean.
