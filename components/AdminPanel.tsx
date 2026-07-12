"use client";

import { useState } from "react";
import { site } from "@/content/site";

/** Downscale an image in the browser (max 1600px, JPEG) so uploads stay small. */
async function resizeImage(file: File, maxEdge = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

/** Muted editorial accent derived from the cover's average colour. */
async function accentFromCover(file: File): Promise<string> {
  try {
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let hDeg = 0;
    const d = max - min;
    if (d > 0) {
      if (max === rn) hDeg = 60 * (((gn - bn) / d) % 6);
      else if (max === gn) hDeg = 60 * ((bn - rn) / d + 2);
      else hDeg = 60 * ((rn - gn) / d + 4);
    }
    if (hDeg < 0) hDeg += 360;
    const s = 0.32, l = 0.42;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hDeg / 60) % 2) - 1));
    const m = l - c / 2;
    const seg = Math.floor(hDeg / 60) % 6;
    const rgb1 = [ [c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x] ][seg];
    const hex = rgb1.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
    return `#${hex}`;
  } catch {
    return site.accent;
  }
}

type Summary = { slug: string; name: string; title: string; category: string; date: string; featured: boolean };

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"add" | "manage">("add");

  // form state (shared by add & edit)
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [deck, setDeck] = useState("");
  const [category, setCategory] = useState<string>(site.categories[3]);
  const [featured, setFeatured] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [content, setContent] = useState("");

  const [state, setState] = useState<"idle" | "busy" | "done" | "demo" | "error">("idle");
  const [message, setMessage] = useState("");
  const [doneSlug, setDoneSlug] = useState("");
  const [doneVerb, setDoneVerb] = useState("Published");

  // manage state
  const [articles, setArticles] = useState<Summary[] | null>(null);
  const [manageMsg, setManageMsg] = useState("");

  const authHeaders = { "x-admin-password": password };

  const resetForm = () => {
    setEditingSlug(null); setName(""); setRole(""); setTitle(""); setDeck("");
    setCategory(site.categories[3]); setFeatured(false); setCover(null); setPhotos([]); setContent("");
  };

  const friendlyError = (error?: string, slug?: string) =>
    error === "unauthorized" ? "Wrong password."
    : error === "slug_exists" ? `An article for this author already exists (${slug}).`
    : error === "missing_fields" ? "Please fill every required field."
    : error === "not_found" ? "That article no longer exists."
    : "Something went wrong — please try again.";

  const loadArticles = async () => {
    setManageMsg("Loading…");
    try {
      const res = await fetch("/api/admin/articles", { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setManageMsg(friendlyError(data.error)); setArticles(null); return; }
      setArticles(data.articles);
      setManageMsg("");
    } catch {
      setManageMsg("Could not load articles.");
    }
  };

  const startEdit = async (slug: string) => {
    setManageMsg("Opening…");
    try {
      const res = await fetch(`/api/admin/articles?slug=${encodeURIComponent(slug)}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setManageMsg(friendlyError(data.error)); return; }
      const a = data.article;
      setEditingSlug(a.slug); setName(a.name); setRole(a.role); setTitle(a.title); setDeck(a.deck);
      setCategory(a.category); setFeatured(a.featured); setContent(a.body); setCover(null); setPhotos([]);
      setTab("add"); setState("idle"); setMessage(""); setManageMsg("");
    } catch {
      setManageMsg("Could not open the article.");
    }
  };

  const removeArticle = async (slug: string, title: string) => {
    if (!window.confirm(`Remove "${title}" permanently? The article and its images will be deleted from the site.`)) return;
    setManageMsg("Removing…");
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setManageMsg(friendlyError(data.error)); return; }
      setManageMsg(data.demo ? "Dry run — GitHub not connected, nothing deleted." : "Removed. The site is rebuilding.");
      setArticles((list) => (list ?? []).filter((a) => a.slug !== slug));
    } catch {
      setManageMsg("Could not remove the article.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    if (!editingSlug && !cover) { setState("error"); setMessage("Please attach a cover image."); return; }
    setState("busy");
    setMessage("");
    try {
      const fd = new FormData();
      if (editingSlug) fd.set("slug", editingSlug);
      fd.set("name", name); fd.set("role", role); fd.set("title", title); fd.set("deck", deck);
      fd.set("category", category); fd.set("featured", String(featured)); fd.set("content", content);
      if (cover) {
        fd.set("accent", await accentFromCover(cover));
        fd.set("cover", await resizeImage(cover), "cover.jpg");
      }
      for (const p of photos.slice(0, 6)) fd.append("photos", await resizeImage(p), p.name);

      const res = await fetch(editingSlug ? "/api/admin/update" : "/api/admin/publish", {
        method: "POST",
        headers: authHeaders,
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; demo?: boolean; slug?: string; error?: string };
      if (!res.ok || !data.ok) { setState("error"); setMessage(friendlyError(data.error, data.slug)); return; }
      setDoneSlug(data.slug ?? "");
      setDoneVerb(editingSlug ? "Updated" : "Published");
      setState(data.demo ? "demo" : "done");
      setArticles(null);
    } catch {
      setState("error");
      setMessage("Something went wrong — please try again.");
    }
  };

  const label = "block font-hanken text-[10.5px] font-semibold tracking-[.2em] uppercase text-body-2 mb-3";
  const tabBtn = (active: boolean) =>
    `cursor-pointer font-hanken text-[10.5px] font-semibold tracking-[.16em] uppercase py-[9px] px-[15px] rounded-[2px] border transition-colors ${
      active ? "bg-ink text-ondark border-ink" : "bg-transparent text-body-2 border-hairline hover:border-ink"
    }`;

  if (state === "done" || state === "demo") {
    return (
      <div className="border-t border-hairline py-[clamp(40px,6vw,72px)] text-center">
        <div className="font-playfair italic text-[clamp(28px,3.6vw,44px)] leading-[1.16] text-ink mb-[18px]">
          {state === "done" ? `${doneVerb} — the story is on its way.` : "Dry run complete."}
        </div>
        <p className="text-[15px] leading-[1.6] text-body-1 max-w-[52ch] mx-auto mb-6">
          {state === "done"
            ? `The change was committed to the repository. Hosting is rebuilding now — see it at /article/${doneSlug} in about two minutes.`
            : "GitHub is not connected yet (GITHUB_TOKEN missing), so nothing was committed. The form, validation, and article generation all work."}
        </p>
        <button
          onClick={() => { resetForm(); setState("idle"); }}
          className="pillbtn cursor-pointer border-none bg-ink text-ondark font-hanken text-[11px] font-semibold tracking-[.2em] uppercase py-[13px] px-[26px] rounded-[2px]"
        >
          Back to the editor
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-hairline pt-[clamp(24px,3vw,36px)]">
      <div className="mb-[clamp(22px,3vw,32px)]">
        <label className={label}>Admin password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="inqfield" placeholder="••••••••" />
      </div>

      <div className="flex gap-[9px] mb-[clamp(24px,3vw,36px)]">
        <button type="button" className={tabBtn(tab === "add")} onClick={() => setTab("add")}>
          {editingSlug ? `Editing: ${editingSlug}` : "Add article"}
        </button>
        <button type="button" className={tabBtn(tab === "manage")} onClick={() => { setTab("manage"); if (!articles) loadArticles(); }}>
          Manage articles
        </button>
        {editingSlug && (
          <button type="button" className={tabBtn(false)} onClick={resetForm}>
            Cancel edit
          </button>
        )}
      </div>

      {tab === "manage" ? (
        <div>
          {manageMsg && <p className="font-hanken text-[11px] tracking-[.08em] text-muted mb-4">{manageMsg}</p>}
          {articles?.map((a) => (
            <div key={a.slug} className="flex items-center gap-4 py-[14px] border-b border-hairline">
              <div className="flex-1 min-w-0">
                <div className="font-playfair font-medium text-[17px] text-ink leading-[1.2]">{a.title}</div>
                <div className="font-hanken text-[9.5px] tracking-[.14em] uppercase text-muted mt-1">
                  {a.name} · {a.category} · {a.date}
                  {a.featured && <span className="ml-2 bg-ink text-ondark rounded-[2px] px-[6px] py-[2px]">Featured</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEdit(a.slug)}
                className="cursor-pointer font-hanken text-[10px] font-semibold tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeArticle(a.slug, a.title)}
                className="cursor-pointer font-hanken text-[10px] font-semibold tracking-[.16em] uppercase text-[#a33] border border-hairline hover:border-[#a33] rounded-[2px] py-2 px-3 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {articles && articles.length === 0 && (
            <p className="font-playfair italic text-[15px] text-muted-2">No articles found.</p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-[clamp(24px,3vw,34px)]">
          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>Author</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="inqfield" placeholder="Full name" />
            </div>
            <div>
              <label className={label}>Role / byline</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} required className="inqfield" placeholder="e.g. Founder, Studio Name" />
            </div>
          </div>

          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>Article title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="inqfield" placeholder="Headline" />
            </div>
            <div>
              <label className={label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="inqfield bg-transparent">
                {site.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Deck — one-line summary shown on cards (optional)</label>
            <input value={deck} onChange={(e) => setDeck(e.target.value)} className="inqfield" placeholder="Leave empty to use the first sentence" />
          </div>

          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>{editingSlug ? "Replace cover (optional)" : "Cover image"}</label>
              <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-playfair italic text-[15px] px-4 text-center">
                {cover ? cover.name : editingSlug ? "Keep current cover…" : "Choose the cover…"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div>
              <label className={label}>{editingSlug ? "Add pictures (optional)" : "Article pictures (up to 6, optional)"}</label>
              <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-playfair italic text-[15px] px-4 text-center">
                {photos.length ? `${photos.length} selected` : "Choose pictures…"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotos([...(e.target.files ?? [])])} />
              </label>
            </div>
          </div>

          <div>
            <label className={label}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={14}
              className="inqfield resize-y leading-[1.66] !py-[14px]"
              placeholder={"Paragraphs separated by blank lines.\n\nOptional: start a line with '## ' for a section heading, or '> ' for a pull quote.\n\nPictures are placed between sections automatically."}
            />
            {editingSlug && (
              <p className="font-hanken text-[9.5px] tracking-[.1em] uppercase text-muted-2 mt-2">
                Lines like ![](/articles/{editingSlug}/01.jpg) are the article&apos;s pictures — move or delete them freely; newly added pictures are appended at the end.
              </p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-[#1c1a17]" />
            <span className="font-hanken text-[10.5px] font-semibold tracking-[.2em] uppercase text-ink">
              Featured — this article takes over the homepage hero
            </span>
          </label>

          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-hairline pt-[clamp(20px,2.6vw,28px)]">
            <span className="font-hanken text-[10px] tracking-[.14em] uppercase text-muted-2">
              {editingSlug ? "Saving updates the live article in about two minutes" : "Publishing commits to the site and goes live in about two minutes"}
            </span>
            <button
              type="submit"
              disabled={state === "busy"}
              className="pillbtn cursor-pointer border-none bg-ink text-ondark font-hanken text-[11px] font-semibold tracking-[.2em] uppercase py-[15px] px-9 rounded-[2px] disabled:opacity-60 disabled:cursor-default"
            >
              {state === "busy" ? "Working…" : editingSlug ? "Save changes" : "Publish article"}
            </button>
          </div>
          {state === "error" && (
            <p className="font-hanken text-[11px] tracking-[.08em] text-[#a33] text-right -mt-3" role="alert">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
