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

/** Aspect ratio "W / H" from an image file, for the poster's card sizing. */
async function aspectFromImage(file: File): Promise<string> {
  try {
    const bmp = await createImageBitmap(file);
    return `${bmp.width} / ${bmp.height}`;
  } catch {
    return "3 / 4";
  }
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

type Summary = { slug: string; name: string; title: string; category: string; date: string; featured: boolean; hidden: boolean; cover: string };
type PosterSummary = { slug: string; title: string; category: string; date: string; cover: string; count: number };
type EditorialSummary = { slug: string; title: string; eyebrow: string; date: string; cover: string; count: number };
type EditSummary = { slug: string; title: string; kicker: string; date: string; cover: string; order: number; inDeck: boolean };

type Tab = "add" | "manage" | "poster" | "manage-posters" | "editorial" | "manage-editorials" | "edit" | "manage-edits";

const BODY_HINT =
  "Leave a blank line between paragraphs.\n\n## A heading, if the piece needs one\n\n> A pull quote on its own line";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("add");

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
  const [doneKind, setDoneKind] = useState<"article" | "poster" | "editorial" | "edit">("article");

  // manage state
  const [articles, setArticles] = useState<Summary[] | null>(null);
  const [manageMsg, setManageMsg] = useState("");
  const [articleSearch, setArticleSearch] = useState("");

  // poster form state
  const [editingPosterSlug, setEditingPosterSlug] = useState<string | null>(null);
  const [pTitle, setPTitle] = useState("");
  const [pCategory, setPCategory] = useState<string>(site.categories[0]);
  const [pImages, setPImages] = useState<File[]>([]);
  const [pCaptions, setPCaptions] = useState("");
  const [pHashtags, setPHashtags] = useState("");
  const [pNote, setPNote] = useState("");
  const [posters, setPosters] = useState<PosterSummary[] | null>(null);
  const [postersMsg, setPostersMsg] = useState("");
  const [posterSearch, setPosterSearch] = useState("");

  // editorial form state
  const [editingEditorialSlug, setEditingEditorialSlug] = useState<string | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eEyebrow, setEEyebrow] = useState("");
  const [eImages, setEImages] = useState<File[]>([]);
  const [editorials, setEditorials] = useState<EditorialSummary[] | null>(null);
  const [editorialsMsg, setEditorialsMsg] = useState("");
  const [editorialSearch, setEditorialSearch] = useState("");

  // THT Edit form state
  const [editingEditSlug, setEditingEditSlug] = useState<string | null>(null);
  const [xTitle, setXTitle] = useState("");
  const [xKicker, setXKicker] = useState("Culture");
  const [xDeck, setXDeck] = useState("");
  const [xInDeck, setXInDeck] = useState(true);
  const [xCover, setXCover] = useState<File | null>(null);
  const [xPhotos, setXPhotos] = useState<File[]>([]);
  const [xContent, setXContent] = useState("");
  const [edits, setEdits] = useState<EditSummary[] | null>(null);
  const [editsMsg, setEditsMsg] = useState("");
  const [editSearch, setEditSearch] = useState("");

  const authHeaders = { "x-admin-password": password };

  const resetForm = () => {
    setEditingSlug(null); setName(""); setRole(""); setTitle(""); setDeck("");
    setCategory(site.categories[3]); setFeatured(false); setCover(null); setPhotos([]); setContent("");
  };

  const friendlyError = (error?: string, slug?: string) =>
    error === "unauthorized" ? "Wrong password."
    : error === "slug_exists" ? `Something with this name already exists (${slug}).`
    : error === "missing_fields" ? "Please fill every required field."
    : error === "bad_category" ? "Please choose a valid category."
    : error === "too_many_images" ? "Too many images — please choose fewer."
    : error === "not_found" ? "That item no longer exists."
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

  const toggleHidden = async (slug: string, hidden: boolean) => {
    setManageMsg(hidden ? "Hiding…" : "Unhiding…");
    try {
      const res = await fetch("/api/admin/visibility", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ slug, hidden }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setManageMsg(friendlyError(data.error)); return; }
      setArticles((list) => (list ?? []).map((a) => (a.slug === slug ? { ...a, hidden } : a)));
      setManageMsg(
        data.demo
          ? "Dry run — GitHub not connected, nothing changed."
          : hidden
            ? "Hidden. The site is rebuilding — the article disappears in about two minutes."
            : "Unhidden. The site is rebuilding — the article returns in about two minutes."
      );
    } catch {
      setManageMsg("Could not change visibility.");
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
      setDoneKind("article");
      setState(data.demo ? "demo" : "done");
      setArticles(null);
    } catch {
      setState("error");
      setMessage("Something went wrong — please try again.");
    }
  };

  const resetPoster = () => {
    setEditingPosterSlug(null); setPTitle(""); setPCategory(site.categories[0]); setPImages([]);
    setPCaptions(""); setPHashtags(""); setPNote("");
  };

  const loadPosters = async () => {
    setPostersMsg("Loading…");
    try {
      const res = await fetch("/api/admin/posters", { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setPostersMsg(friendlyError(data.error)); setPosters(null); return; }
      setPosters(data.posters);
      setPostersMsg("");
    } catch {
      setPostersMsg("Could not load posters.");
    }
  };

  const startEditPoster = async (slug: string) => {
    setPostersMsg("Opening…");
    try {
      const res = await fetch(`/api/admin/posters?slug=${encodeURIComponent(slug)}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setPostersMsg(friendlyError(data.error)); return; }
      const p = data.poster;
      setEditingPosterSlug(p.slug); setPTitle(p.title); setPCategory(p.category);
      setPCaptions((p.captions ?? []).join("\n")); setPHashtags(p.hashtags ?? ""); setPNote(p.note ?? ""); setPImages([]);
      setTab("poster"); setState("idle"); setMessage(""); setPostersMsg("");
    } catch {
      setPostersMsg("Could not open the poster.");
    }
  };

  const removePoster = async (slug: string, title: string) => {
    if (!window.confirm(`Remove "${title}" permanently? The poster and its images will be deleted from the site.`)) return;
    setPostersMsg("Removing…");
    try {
      const res = await fetch(`/api/admin/posters?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setPostersMsg(friendlyError(data.error)); return; }
      setPostersMsg(data.demo ? "Dry run — GitHub not connected, nothing deleted." : "Removed. The site is rebuilding.");
      setPosters((list) => (list ?? []).filter((p) => p.slug !== slug));
    } catch {
      setPostersMsg("Could not remove the poster.");
    }
  };

  const submitPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    if (!editingPosterSlug && !pImages.length) { setState("error"); setMessage("Please attach at least one poster image."); return; }
    setState("busy");
    setMessage("");
    try {
      const fd = new FormData();
      if (editingPosterSlug) fd.set("slug", editingPosterSlug);
      fd.set("title", pTitle);
      fd.set("category", pCategory);
      fd.set("captions", pCaptions);
      fd.set("hashtags", pHashtags);
      fd.set("note", pNote);
      if (pImages.length) fd.set("aspectRatio", await aspectFromImage(pImages[0]));
      for (const img of pImages.slice(0, 10)) fd.append("images", await resizeImage(img), img.name);

      const res = await fetch("/api/admin/posters", { method: editingPosterSlug ? "PUT" : "POST", headers: authHeaders, body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; demo?: boolean; slug?: string; error?: string };
      if (!res.ok || !data.ok) { setState("error"); setMessage(friendlyError(data.error, data.slug)); return; }
      setDoneSlug(data.slug ?? "");
      setDoneVerb(editingPosterSlug ? "Updated" : "Added");
      setDoneKind("poster");
      setState(data.demo ? "demo" : "done");
      setPosters(null);
    } catch {
      setState("error");
      setMessage("Something went wrong — please try again.");
    }
  };

  const resetEdit = () => {
    setEditingEditSlug(null); setXTitle(""); setXKicker("Culture"); setXDeck("");
    setXInDeck(true); setXCover(null); setXPhotos([]); setXContent("");
  };

  const loadEdits = async () => {
    setEditsMsg("Loading…");
    try {
      const res = await fetch("/api/admin/edit", { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditsMsg(friendlyError(data.error)); setEdits(null); return; }
      setEdits(data.edits);
      setEditsMsg("");
    } catch {
      setEditsMsg("Could not load the Edit pieces.");
    }
  };

  const startEditEdit = async (slug: string) => {
    setEditsMsg("Opening…");
    try {
      const res = await fetch(`/api/admin/edit?slug=${encodeURIComponent(slug)}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditsMsg(friendlyError(data.error)); return; }
      const x = data.edit;
      setEditingEditSlug(x.slug); setXTitle(x.title); setXKicker(x.kicker || "Culture");
      setXDeck(x.deck ?? ""); setXInDeck(x.inDeck); setXCover(null); setXPhotos([]);
      // strip the generated figure lines and section breaks back to plain text
      setXContent(
        String(x.body ?? "")
          .replace(/^!\[.*$/gm, "")      // generated figure lines
          .replace(/^-{3,}$/gm, "")      // generated section breaks
          .replace(/\n{3,}/g, "\n\n")    // the gaps they left behind
          .trim()
      );
      setTab("edit"); setState("idle"); setMessage(""); setEditsMsg("");
    } catch {
      setEditsMsg("Could not open the piece.");
    }
  };

  /** Moves a piece between the fanned deck and the THT Edit section. */
  const toggleInDeck = async (slug: string, inDeck: boolean) => {
    setEditsMsg(inDeck ? "Adding to the deck…" : "Taking out of the deck…");
    try {
      const res = await fetch("/api/admin/edit", {
        method: "PATCH",
        headers: { ...authHeaders, "content-type": "application/json" },
        body: JSON.stringify({ slug, inDeck }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditsMsg(friendlyError(data.error)); return; }
      setEdits((list) => (list ?? []).map((x) => (x.slug === slug ? { ...x, inDeck } : x)));
      setEditsMsg(
        data.demo
          ? "Dry run — GitHub not connected, nothing changed."
          : inDeck
            ? "Back in the deck. The site is rebuilding."
            : "Out of the deck. It stays in the THT Edit section. The site is rebuilding."
      );
    } catch {
      setEditsMsg("Could not move the piece.");
    }
  };

  const removeEdit = async (slug: string, title: string) => {
    if (!window.confirm(`Remove "${title}" permanently? The piece and its images will be deleted from the site.`)) return;
    setEditsMsg("Removing…");
    try {
      const res = await fetch(`/api/admin/edit?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditsMsg(friendlyError(data.error)); return; }
      setEditsMsg(data.demo ? "Dry run — GitHub not connected, nothing deleted." : "Removed. The site is rebuilding.");
      setEdits((list) => (list ?? []).filter((x) => x.slug !== slug));
    } catch {
      setEditsMsg("Could not remove the piece.");
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy"); setMessage("");
    try {
      const fd = new FormData();
      fd.set("title", xTitle);
      fd.set("kicker", xKicker);
      fd.set("deck", xDeck);
      fd.set("inDeck", String(xInDeck));
      fd.set("content", xContent);
      // same as an article: the accent is sampled from the cover it is given
      if (xCover) {
        fd.set("accent", await accentFromCover(xCover));
        fd.set("cover", xCover);
      }
      for (const p of xPhotos) fd.append("photos", p);
      const url = editingEditSlug ? `/api/admin/edit?slug=${encodeURIComponent(editingEditSlug)}` : "/api/admin/edit";
      const res = await fetch(url, { method: editingEditSlug ? "PUT" : "POST", headers: authHeaders, body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; demo?: boolean; slug?: string; error?: string };
      if (!res.ok || !data.ok) { setState("error"); setMessage(friendlyError(data.error, data.slug)); return; }
      setDoneSlug(data.slug ?? "");
      setDoneVerb(editingEditSlug ? "Updated" : "Added");
      setDoneKind("edit");
      setState(data.demo ? "demo" : "done");
      setEdits(null);
    } catch {
      setState("error");
      setMessage("Something went wrong — please try again.");
    }
  };

  const resetEditorial = () => {
    setEditingEditorialSlug(null); setETitle(""); setEEyebrow(""); setEImages([]);
  };

  const loadEditorials = async () => {
    setEditorialsMsg("Loading…");
    try {
      const res = await fetch("/api/admin/editorials", { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditorialsMsg(friendlyError(data.error)); setEditorials(null); return; }
      setEditorials(data.editorials);
      setEditorialsMsg("");
    } catch {
      setEditorialsMsg("Could not load editorials.");
    }
  };

  const startEditEditorial = async (slug: string) => {
    setEditorialsMsg("Opening…");
    try {
      const res = await fetch(`/api/admin/editorials?slug=${encodeURIComponent(slug)}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditorialsMsg(friendlyError(data.error)); return; }
      const ed = data.editorial;
      setEditingEditorialSlug(ed.slug); setETitle(ed.title); setEEyebrow(ed.eyebrow ?? ""); setEImages([]);
      setTab("editorial"); setState("idle"); setMessage(""); setEditorialsMsg("");
    } catch {
      setEditorialsMsg("Could not open the editorial.");
    }
  };

  const removeEditorial = async (slug: string, title: string) => {
    if (!window.confirm(`Remove "${title}" permanently? The editorial and its images will be deleted from the site.`)) return;
    setEditorialsMsg("Removing…");
    try {
      const res = await fetch(`/api/admin/editorials?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditorialsMsg(friendlyError(data.error)); return; }
      setEditorialsMsg(data.demo ? "Dry run — GitHub not connected, nothing deleted." : "Removed. The site is rebuilding.");
      setEditorials((list) => (list ?? []).filter((ed) => ed.slug !== slug));
    } catch {
      setEditorialsMsg("Could not remove the editorial.");
    }
  };

  const submitEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    if (!editingEditorialSlug && !eImages.length) { setState("error"); setMessage("Please attach at least one carousel image."); return; }
    setState("busy");
    setMessage("");
    try {
      const fd = new FormData();
      if (editingEditorialSlug) fd.set("slug", editingEditorialSlug);
      fd.set("title", eTitle);
      fd.set("eyebrow", eEyebrow);
      for (const img of eImages.slice(0, 12)) fd.append("images", await resizeImage(img), img.name);

      const res = await fetch("/api/admin/editorials", { method: editingEditorialSlug ? "PUT" : "POST", headers: authHeaders, body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; demo?: boolean; slug?: string; error?: string };
      if (!res.ok || !data.ok) { setState("error"); setMessage(friendlyError(data.error, data.slug)); return; }
      setDoneSlug(data.slug ?? "");
      setDoneVerb(editingEditorialSlug ? "Updated" : "Added");
      setDoneKind("editorial");
      setState(data.demo ? "demo" : "done");
      setEditorials(null);
    } catch {
      setState("error");
      setMessage("Something went wrong — please try again.");
    }
  };

  const label = "block font-ui text-[10.5px] font-black tracking-[.2em] uppercase text-body-2 mb-3";
  const tabBtn = (active: boolean) =>
    `cursor-pointer font-ui text-[10.5px] font-black tracking-[.16em] uppercase py-[9px] px-[15px] rounded-[2px] border transition-colors ${
      active ? "bg-ink text-ondark border-ink" : "bg-transparent text-body-2 border-hairline hover:border-ink"
    }`;

  if (state === "done" || state === "demo") {
    return (
      <div className="border-t border-hairline py-[clamp(40px,6vw,72px)] text-center">
        <div className="font-display italic text-[clamp(28px,3.6vw,44px)] leading-[1.16] text-ink mb-[18px]">
          {state === "done"
            ? doneKind === "poster" ? `${doneVerb} — the poster is on its way.`
              : doneKind === "editorial" ? `${doneVerb} — the editorial is on its way.`
              : `${doneVerb} — the story is on its way.`
            : "Dry run complete."}
        </div>
        <p className="text-[15px] leading-[1.6] text-body-1 max-w-[52ch] mx-auto mb-6">
          {state === "done"
            ? doneKind === "poster"
              ? "The poster was committed to the repository. Hosting is rebuilding now — it appears in the cover gallery in about two minutes."
              : doneKind === "editorial"
                ? "The editorial was committed to the repository. Hosting is rebuilding now — its card appears in the editorials band in about two minutes."
                : `The change was committed to the repository. Hosting is rebuilding now — see it at /article/${doneSlug} in about two minutes.`
            : "GitHub is not connected yet (GITHUB_TOKEN missing), so nothing was committed. The form and validation all work."}
        </p>
        <button
          onClick={() => { doneKind === "poster" ? resetPoster() : doneKind === "editorial" ? resetEditorial() : resetForm(); setState("idle"); }}
          className="pillbtn cursor-pointer border-none bg-ink text-ondark font-ui text-[11px] font-black tracking-[.2em] uppercase py-[13px] px-[26px] rounded-[2px]"
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

      <div className="flex flex-wrap gap-[9px] mb-[clamp(24px,3vw,36px)]">
        <button type="button" className={tabBtn(tab === "add")} onClick={() => setTab("add")}>
          {editingSlug ? `Editing: ${editingSlug}` : "Add article"}
        </button>
        <button type="button" className={tabBtn(tab === "manage")} onClick={() => { setTab("manage"); if (!articles) loadArticles(); }}>
          Manage articles
        </button>
        <button type="button" className={tabBtn(tab === "poster")} onClick={() => { setTab("poster"); setState("idle"); setMessage(""); }}>
          {editingPosterSlug ? `Editing: ${editingPosterSlug}` : "Add poster"}
        </button>
        <button type="button" className={tabBtn(tab === "manage-posters")} onClick={() => { setTab("manage-posters"); if (!posters) loadPosters(); }}>
          Manage posters
        </button>
        <button type="button" className={tabBtn(tab === "editorial")} onClick={() => { setTab("editorial"); setState("idle"); setMessage(""); }}>
          {editingEditorialSlug ? `Editing: ${editingEditorialSlug}` : "Add editorial"}
        </button>
        <button type="button" className={tabBtn(tab === "manage-editorials")} onClick={() => { setTab("manage-editorials"); if (!editorials) loadEditorials(); }}>
          Manage editorials
        </button>
        <button type="button" className={tabBtn(tab === "edit")} onClick={() => { setTab("edit"); setState("idle"); setMessage(""); }}>
          {editingEditSlug ? `Editing: ${editingEditSlug}` : "Add THT Edit"}
        </button>
        <button type="button" className={tabBtn(tab === "manage-edits")} onClick={() => { setTab("manage-edits"); if (!edits) loadEdits(); }}>
          Manage THT Edit
        </button>
      </div>

      {tab === "manage" ? (
        <div>
          <input
            value={articleSearch}
            onChange={(e) => setArticleSearch(e.target.value)}
            className="inqfield mb-5"
            placeholder="Search articles by title, author, or category…"
          />
          {manageMsg && <p className="font-ui text-[11px] tracking-[.08em] text-muted mb-4">{manageMsg}</p>}
          {articles
            ?.filter((a) => `${a.title} ${a.name} ${a.category}`.toLowerCase().includes(articleSearch.trim().toLowerCase()))
            .map((a) => (
            <div key={a.slug} className="flex items-center gap-4 py-[14px] border-b border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.cover}
                alt=""
                className={`w-[52px] h-[68px] flex-none object-cover rounded-[2px] bg-soft border border-hairline ${a.hidden ? "opacity-45" : ""}`}
                loading="lazy"
              />
              <div className={`flex-1 min-w-0 ${a.hidden ? "opacity-45" : ""}`}>
                <div className="font-display font-black text-[17px] text-ink leading-[1.2]">{a.title}</div>
                <div className="font-ui text-[9.5px] tracking-[.14em] uppercase text-muted mt-1">
                  {a.name} · {a.category} · {a.date}
                  {a.featured && <span className="ml-2 bg-ink text-ondark rounded-[2px] px-[6px] py-[2px]">Featured</span>}
                  {a.hidden && <span className="ml-2 border border-hairline text-muted rounded-[2px] px-[6px] py-[2px]">Hidden</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEdit(a.slug)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => toggleHidden(a.slug, !a.hidden)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                {a.hidden ? "Unhide" : "Hide"}
              </button>
              <button
                type="button"
                onClick={() => removeArticle(a.slug, a.title)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-[#a33] border border-hairline hover:border-[#a33] rounded-[2px] py-2 px-3 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {articles && articles.length === 0 && (
            <p className="font-display italic text-[15px] text-muted-2">No articles found.</p>
          )}
        </div>
      ) : tab === "manage-posters" ? (
        <div>
          <input
            value={posterSearch}
            onChange={(e) => setPosterSearch(e.target.value)}
            className="inqfield mb-5"
            placeholder="Search posters by title or category…"
          />
          {postersMsg && <p className="font-ui text-[11px] tracking-[.08em] text-muted mb-4">{postersMsg}</p>}
          {posters
            ?.filter((p) => `${p.title} ${p.category}`.toLowerCase().includes(posterSearch.trim().toLowerCase()))
            .map((p) => (
            <div key={p.slug} className="flex items-center gap-4 py-[14px] border-b border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.cover}
                alt=""
                className="w-[52px] h-[68px] flex-none object-cover rounded-[2px] bg-soft border border-hairline"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-[17px] text-ink leading-[1.2]">{p.title}</div>
                <div className="font-ui text-[9.5px] tracking-[.14em] uppercase text-muted mt-1">
                  {p.category} · {p.date} · {p.count === 1 ? "1 image" : `${p.count} images`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEditPoster(p.slug)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removePoster(p.slug, p.title)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-[#a33] border border-hairline hover:border-[#a33] rounded-[2px] py-2 px-3 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {posters && posters.length === 0 && (
            <p className="font-display italic text-[15px] text-muted-2">No posters yet.</p>
          )}
        </div>
      ) : tab === "manage-editorials" ? (
        <div>
          <input
            value={editorialSearch}
            onChange={(e) => setEditorialSearch(e.target.value)}
            className="inqfield mb-5"
            placeholder="Search editorials by title or eyebrow…"
          />
          {editorialsMsg && <p className="font-ui text-[11px] tracking-[.08em] text-muted mb-4">{editorialsMsg}</p>}
          {editorials
            ?.filter((ed) => `${ed.title} ${ed.eyebrow}`.toLowerCase().includes(editorialSearch.trim().toLowerCase()))
            .map((ed) => (
            <div key={ed.slug} className="flex items-center gap-4 py-[14px] border-b border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ed.cover}
                alt=""
                className="w-[52px] h-[68px] flex-none object-cover rounded-[2px] bg-soft border border-hairline"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-[17px] text-ink leading-[1.2]">{ed.title}</div>
                <div className="font-ui text-[9.5px] tracking-[.14em] uppercase text-muted mt-1">
                  {ed.eyebrow ? `${ed.eyebrow} · ` : ""}{ed.date} · {ed.count === 1 ? "1 page" : `${ed.count} pages`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEditEditorial(ed.slug)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeEditorial(ed.slug, ed.title)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-[#a33] border border-hairline hover:border-[#a33] rounded-[2px] py-2 px-3 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {editorials && editorials.length === 0 && (
            <p className="font-display italic text-[15px] text-muted-2">No editorials yet.</p>
          )}
        </div>
      ) : tab === "manage-edits" ? (
        <div>
          <input
            value={editSearch}
            onChange={(e) => setEditSearch(e.target.value)}
            className="inqfield mb-5"
            placeholder="Search THT Edit by title or kicker."
          />
          <p className="font-ui text-[10px] tracking-[.12em] uppercase text-muted-2 mb-4">
            The THT Edit section lists every piece. The deck at the top of the landing page fans only the
            newest {site.editDeckSize}, so anything past that waits in the section on its own. Take a piece out of the
            deck to keep it out of the fan entirely.
          </p>
          {editsMsg && <p className="font-ui text-[11px] tracking-[.08em] text-muted mb-4">{editsMsg}</p>}
          {edits
            ?.filter((x) => `${x.title} ${x.kicker}`.toLowerCase().includes(editSearch.trim().toLowerCase()))
            .map((x) => (
            <div key={x.slug} className="flex items-center gap-4 py-[14px] border-b border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={x.cover}
                alt=""
                className={`w-[52px] h-[68px] flex-none object-cover rounded-[2px] bg-soft border border-hairline ${x.inDeck ? "" : "opacity-55"}`}
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-[17px] text-ink leading-[1.2]">
                  {x.title}
                  {!x.inDeck && (
                    <span className="ml-2 font-ui text-[9px] tracking-[.14em] uppercase border border-hairline text-muted rounded-[2px] px-[6px] py-[2px]">
                      Not in deck
                    </span>
                  )}
                </div>
                <div className="font-ui text-[9.5px] tracking-[.14em] uppercase text-muted mt-1">
                  {x.kicker} &middot; {x.date}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleInDeck(x.slug, !x.inDeck)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                {x.inDeck ? "Remove from deck" : "Show in deck"}
              </button>
              <button
                type="button"
                onClick={() => startEditEdit(x.slug)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-ink border border-hairline hover:border-ink rounded-[2px] py-2 px-3 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeEdit(x.slug, x.title)}
                className="cursor-pointer font-ui text-[10px] font-black tracking-[.16em] uppercase text-[#a33] border border-hairline hover:border-[#a33] rounded-[2px] py-2 px-3 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {edits && edits.length === 0 && (
            <p className="font-display italic text-[15px] text-muted-2">No THT Edit pieces yet.</p>
          )}
        </div>
      ) : tab === "edit" ? (
        <form onSubmit={submitEdit} className="flex flex-col gap-[clamp(24px,3vw,34px)]">
          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>Title</label>
              <input value={xTitle} onChange={(e) => setXTitle(e.target.value)} required className="inqfield" placeholder="e.g. When Beauty Gets Bolder" />
            </div>
            <div>
              <label className={label}>Kicker</label>
              <input value={xKicker} onChange={(e) => setXKicker(e.target.value)} className="inqfield" placeholder="e.g. Fashion, Culture, Beauty, Science" />
            </div>
          </div>

          <div>
            <label className={label}>Standfirst (optional)</label>
            <input value={xDeck} onChange={(e) => setXDeck(e.target.value)} className="inqfield" placeholder="One line under the cover. Left empty, the first sentence is used." />
          </div>

          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>{editingEditSlug ? "Replace cover (optional)" : "Cover"}</label>
              <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-display italic text-[15px] px-4 text-center">
                {xCover ? xCover.name : editingEditSlug ? "Keep current cover" : "Choose the cover"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setXCover(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div>
              <label className={label}>Pictures (optional, up to 6)</label>
              <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-display italic text-[15px] px-4 text-center">
                {xPhotos.length ? `${xPhotos.length} selected` : "Choose pictures"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setXPhotos([...(e.target.files ?? [])])} />
              </label>
            </div>
          </div>

          <div>
            <label className={label}>Text</label>
            <textarea
              value={xContent}
              onChange={(e) => setXContent(e.target.value)}
              required
              rows={12}
              className="inqfield resize-y"
              placeholder={BODY_HINT}
            />
            <p className="font-ui text-[9.5px] tracking-[.1em] uppercase text-muted-2 mt-2">
              Pictures are spread evenly between the paragraphs. Short pieces are set larger and more open,
              so a hundred words still fills the page.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={xInDeck} onChange={(e) => setXInDeck(e.target.checked)} className="w-4 h-4 accent-[#1c1a17]" />
            <span className="font-ui text-[11px] tracking-[.14em] uppercase text-ink">Show in the deck</span>
            <span className="font-ui text-[10px] tracking-[.1em] uppercase text-muted-2">
              It joins the THT Edit section either way
            </span>
          </label>

          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-hairline pt-[clamp(20px,2.6vw,28px)]">
            <span className="font-ui text-[10px] tracking-[.14em] uppercase text-muted-2">
              {editingEditSlug ? "Saving updates the live piece in about two minutes" : "Adding commits it and goes live in about two minutes"}
            </span>
            <div className="flex items-center gap-3">
              {editingEditSlug && (
                <button type="button" onClick={resetEdit} className={tabBtn(false)}>
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={state === "busy"}
                className="pillbtn cursor-pointer border-none bg-ink text-ondark font-ui text-[11px] font-black tracking-[.2em] uppercase py-[15px] px-9 rounded-[2px] disabled:opacity-60 disabled:cursor-default"
              >
                {state === "busy" ? "Working" : editingEditSlug ? "Save changes" : "Add to THT Edit"}
              </button>
            </div>
          </div>
          {state === "error" && (
            <p className="font-ui text-[11px] tracking-[.08em] text-[#a33] text-right -mt-3" role="alert">{message}</p>
          )}
        </form>
      ) : tab === "poster" ? (
        <form onSubmit={submitPoster} className="flex flex-col gap-[clamp(24px,3vw,34px)]">
          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>Poster title</label>
              <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} required className="inqfield" placeholder="e.g. Meryl Streep — A Life in Cinema" />
            </div>
            <div>
              <label className={label}>Category</label>
              <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="inqfield bg-transparent">
                {site.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>
              {editingPosterSlug ? "Replace images — the first is the cover (optional)" : "Poster images — the first is the cover (up to 10)"}
            </label>
            <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-display italic text-[15px] px-4 text-center">
              {pImages.length ? `${pImages.length} selected · ${pImages[0].name}` : editingPosterSlug ? "Keep current images…" : "Choose the poster pages…"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPImages([...(e.target.files ?? [])])} />
            </label>
            <p className="font-ui text-[9.5px] tracking-[.1em] uppercase text-muted-2 mt-2">
              {editingPosterSlug
                ? "Leave empty to keep the current images. Choosing new ones replaces the whole set."
                : "Card shape follows the first image. Select pages in the order they should appear in the pop-up."}
            </p>
          </div>

          <div>
            <label className={label}>Captions — one per line, shown in the pop-up (optional)</label>
            <textarea
              value={pCaptions}
              onChange={(e) => setPCaptions(e.target.value)}
              rows={6}
              className="inqfield resize-y leading-[1.66] !py-[14px]"
              placeholder={"One caption per line.\nSelf-captioned artwork needs none — leave empty."}
            />
          </div>

          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>Hashtags (optional)</label>
              <input value={pHashtags} onChange={(e) => setPHashtags(e.target.value)} className="inqfield" placeholder="#example #thehumanthread" />
            </div>
            <div>
              <label className={label}>Closing note (optional)</label>
              <input value={pNote} onChange={(e) => setPNote(e.target.value)} className="inqfield" placeholder="A one-line italic sign-off" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-hairline pt-[clamp(20px,2.6vw,28px)]">
            <span className="font-ui text-[10px] tracking-[.14em] uppercase text-muted-2">
              {editingPosterSlug ? "Saving updates the live poster in about two minutes" : "Adding a poster commits it and goes live in about two minutes"}
            </span>
            <div className="flex items-center gap-3">
              {editingPosterSlug && (
                <button type="button" onClick={resetPoster} className={tabBtn(false)}>
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={state === "busy"}
                className="pillbtn cursor-pointer border-none bg-ink text-ondark font-ui text-[11px] font-black tracking-[.2em] uppercase py-[15px] px-9 rounded-[2px] disabled:opacity-60 disabled:cursor-default"
              >
                {state === "busy" ? "Working…" : editingPosterSlug ? "Save changes" : "Add poster"}
              </button>
            </div>
          </div>
          {state === "error" && (
            <p className="font-ui text-[11px] tracking-[.08em] text-[#a33] text-right -mt-3" role="alert">{message}</p>
          )}
        </form>
      ) : tab === "editorial" ? (
        <form onSubmit={submitEditorial} className="flex flex-col gap-[clamp(24px,3vw,34px)]">
          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)]">
            <div>
              <label className={label}>Editorial title</label>
              <input value={eTitle} onChange={(e) => setETitle(e.target.value)} required className="inqfield" placeholder="e.g. Kateryna Migush" />
            </div>
            <div>
              <label className={label}>Eyebrow (optional)</label>
              <input value={eEyebrow} onChange={(e) => setEEyebrow(e.target.value)} className="inqfield" placeholder="e.g. The Editorial · Issue 03" />
            </div>
          </div>

          <div>
            <label className={label}>
              {editingEditorialSlug ? "Replace images — the first is the cover (optional)" : "Carousel images — the first is the cover (up to 12)"}
            </label>
            <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-display italic text-[15px] px-4 text-center">
              {eImages.length ? `${eImages.length} selected · ${eImages[0].name}` : editingEditorialSlug ? "Keep current images…" : "Choose the carousel images…"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setEImages([...(e.target.files ?? [])])} />
            </label>
            <p className="font-ui text-[9.5px] tracking-[.1em] uppercase text-muted-2 mt-2">
              {editingEditorialSlug
                ? "Leave empty to keep the current images. Choosing new ones replaces the whole set."
                : "This becomes a card in the editorials band; the first image is the cover. Select images in the order they should appear in the pop-up carousel."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-hairline pt-[clamp(20px,2.6vw,28px)]">
            <span className="font-ui text-[10px] tracking-[.14em] uppercase text-muted-2">
              {editingEditorialSlug ? "Saving updates the live editorial in about two minutes" : "Adding an editorial commits it and goes live in about two minutes"}
            </span>
            <div className="flex items-center gap-3">
              {editingEditorialSlug && (
                <button type="button" onClick={resetEditorial} className={tabBtn(false)}>
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={state === "busy"}
                className="pillbtn cursor-pointer border-none bg-ink text-ondark font-ui text-[11px] font-black tracking-[.2em] uppercase py-[15px] px-9 rounded-[2px] disabled:opacity-60 disabled:cursor-default"
              >
                {state === "busy" ? "Working…" : editingEditorialSlug ? "Save changes" : "Add editorial"}
              </button>
            </div>
          </div>
          {state === "error" && (
            <p className="font-ui text-[11px] tracking-[.08em] text-[#a33] text-right -mt-3" role="alert">{message}</p>
          )}
        </form>
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
              <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-display italic text-[15px] px-4 text-center">
                {cover ? cover.name : editingSlug ? "Keep current cover…" : "Choose the cover…"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div>
              <label className={label}>{editingSlug ? "Add pictures (optional)" : "Article pictures (up to 6, optional)"}</label>
              <label className="drop cursor-pointer flex items-center justify-center bg-soft rounded-[2px] h-[92px] text-muted font-display italic text-[15px] px-4 text-center">
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
              <p className="font-ui text-[9.5px] tracking-[.1em] uppercase text-muted-2 mt-2">
                Lines like ![](/articles/{editingSlug}/01.jpg) are the article&apos;s pictures — move or delete them freely; newly added pictures are appended at the end.
              </p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-[#1c1a17]" />
            <span className="font-ui text-[10.5px] font-black tracking-[.2em] uppercase text-ink">
              Featured — this article takes over the homepage hero
            </span>
          </label>

          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-hairline pt-[clamp(20px,2.6vw,28px)]">
            <span className="font-ui text-[10px] tracking-[.14em] uppercase text-muted-2">
              {editingSlug ? "Saving updates the live article in about two minutes" : "Publishing commits to the site and goes live in about two minutes"}
            </span>
            <button
              type="submit"
              disabled={state === "busy"}
              className="pillbtn cursor-pointer border-none bg-ink text-ondark font-ui text-[11px] font-black tracking-[.2em] uppercase py-[15px] px-9 rounded-[2px] disabled:opacity-60 disabled:cursor-default"
            >
              {state === "busy" ? "Working…" : editingSlug ? "Save changes" : "Publish article"}
            </button>
          </div>
          {state === "error" && (
            <p className="font-ui text-[11px] tracking-[.08em] text-[#a33] text-right -mt-3" role="alert">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
