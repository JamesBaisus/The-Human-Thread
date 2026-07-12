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
| `/` | Single-page landing: hero, editorial carousel, marquee, posters gallery (+lightbox), category sections (`#cat-<slug>`), about (`#about`), dark feature band |
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

## Backend: meeting booking

Two API routes power the booking feature (they run as Netlify Functions —
no separate server). They degrade to a clearly-labelled **demo mode** until
the environment variables are set, so the site never breaks.

**Meeting booking → Google Calendar + Meet** (`/api/book`, `/api/availability`)
When a visitor confirms a slot, an event is created on the owner's Google
Calendar with an auto-generated Google Meet link; Google emails the invitation
to both sides. Picking a day also queries the calendar's free/busy status and
greys out already-taken slots. One-time setup (owner's Google account):

1. [console.cloud.google.com](https://console.cloud.google.com) → new project → enable **Google Calendar API**
2. OAuth consent screen → External → add the owner's Gmail as a test user
3. Credentials → **OAuth client ID** (Web application) with redirect URI `https://developers.google.com/oauthplayground`
4. [OAuth Playground](https://developers.google.com/oauthplayground) → gear icon →
   "Use your own OAuth credentials" → authorize scopes
   `https://www.googleapis.com/auth/calendar.events` and `.../auth/calendar.freebusy`
   → exchange for tokens → copy the **refresh token**
5. In Netlify → Site → Environment variables, set `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (and optionally
   `GOOGLE_CALENDAR_ID`), then redeploy.

See [.env.example](.env.example) for the full list.

## Admin panel (/admin)

A hidden, password-protected editor page for publishing articles without the
inbox workflow. Inputs: author, role, title, category, deck (optional), cover
image, up to six article pictures, content, and a **featured** toggle (which
automatically un-features the current hero in the same commit).

Publishing does not write to the server — it **commits the MDX + images to the
GitHub repo** via the API, which triggers the normal rebuild; the article is
live in ~2 minutes with blur placeholders, image layouts, and ordering handled
by the existing pipeline. Images are downscaled in the browser before upload,
and the per-article accent colour is derived from the cover automatically.

Setup (env vars in the host): `ADMIN_PASSWORD` (what the editor types in),
`GITHUB_TOKEN` (fine-grained PAT, Contents read/write on this repo only),
optional `GITHUB_REPO` / `GITHUB_BRANCH`. Without them the panel runs in a
dry-run mode that validates and previews but publishes nothing.

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
