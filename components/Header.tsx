"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export type DrawerLink = { label: string; href: string };
export type DrawerGroup = { header: string | null; links: DrawerLink[] };

/**
 * Masthead in the middle, menu on the left, search on the right, and the
 * sections running across a rule beneath it — the arrangement a magazine
 * front page has used in print and now uses on the web.
 *
 * The menu opens as a full page rather than a side drawer, so the sections
 * are set large enough to read as a contents page.
 */

/** The reference signs off its menu with marks, not words. */
function SocialIcon({ name }: { name: string }) {
  const p = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (name.toLowerCase()) {
    case "instagram":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.46 2.21 8.84 2.2 12 2.2Zm0 1.98c-3.14 0-3.5.01-4.74.07-.9.04-1.38.19-1.7.31-.43.17-.73.37-1.05.69-.32.32-.52.62-.69 1.05-.12.32-.27.8-.31 1.7-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.4.9.19 1.38.31 1.7.17.43.37.73.69 1.05.32.32.62.52 1.05.69.32.12.8.27 1.7.31 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.38-.19 1.7-.31.43-.17.73-.37 1.05-.69.32-.32.52-.62.69-1.05.12-.32.27-.8.31-1.7.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.38-.31-1.7a2.84 2.84 0 0 0-.69-1.05 2.84 2.84 0 0 0-1.05-.69c-.32-.12-.8-.27-1.7-.31-1.24-.06-1.6-.07-4.74-.07Zm0 3.37a4.45 4.45 0 1 1 0 8.9 4.45 4.45 0 0 1 0-8.9Zm0 7.34a2.89 2.89 0 1 0 0-5.78 2.89 2.89 0 0 0 0 5.78Zm5.67-7.52a1.04 1.04 0 1 1-2.08 0 1.04 1.04 0 0 1 2.08 0Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33v7.03C18.34 21.24 22 17.08 22 12.06Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M16.6 2h-2.9v12.4a2.5 2.5 0 1 1-2.5-2.5c.26 0 .5.04.74.11V9.04a5.6 5.6 0 0 0-.74-.05 5.5 5.5 0 1 0 5.5 5.5V8.3a6.7 6.7 0 0 0 3.9 1.25V6.6a3.85 3.85 0 0 1-3.9-3.9c0-.23 0-.46-.1-.7Z" />
        </svg>
      );
    case "threads":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M16.3 11.33a6.5 6.5 0 0 0-.25-.11c-.15-2.72-1.63-4.27-4.12-4.29h-.03c-1.49 0-2.73.64-3.49 1.8l1.37.94c.57-.86 1.46-1.04 2.12-1.04h.02c.82 0 1.44.24 1.84.71.29.34.49.82.58 1.42a10.5 10.5 0 0 0-2.36-.11c-2.38.14-3.91 1.53-3.81 3.45.05.98.54 1.82 1.37 2.36.71.46 1.62.69 2.56.64 1.25-.07 2.23-.55 2.91-1.42.52-.67.85-1.53 1-2.62.6.36 1.05.84 1.3 1.42.42.98.45 2.6-.86 3.91-1.15 1.15-2.53 1.64-4.62 1.66-2.31-.02-4.06-.76-5.2-2.21-1.06-1.36-1.61-3.32-1.63-5.83.02-2.51.57-4.47 1.63-5.83 1.14-1.45 2.89-2.19 5.2-2.21 2.33.02 4.11.76 5.29 2.22.58.71 1.02 1.61 1.3 2.66l1.61-.43c-.35-1.29-.9-2.41-1.65-3.33C17.4 2.95 15.21 2.02 12.4 2h-.01c-2.8.02-4.96.95-6.42 2.78C4.67 6.4 4.01 8.67 3.99 11.99v.02c.02 3.32.68 5.59 1.98 7.21 1.46 1.82 3.62 2.76 6.42 2.78h.01c2.49-.02 4.24-.67 5.69-2.11 1.89-1.89 1.84-4.26 1.21-5.71-.45-1.04-1.3-1.89-2.46-2.45Zm-4.28 3.9c-1.04.06-2.12-.41-2.17-1.38-.04-.72.51-1.52 2.24-1.62.2-.01.39-.02.58-.02.63 0 1.21.06 1.74.18-.2 2.47-1.36 2.79-2.39 2.84Z" />
        </svg>
      );
    default:
      return <span className="font-ui text-[10px] font-black tracking-[.2em] uppercase">{name}</span>;
  }
}

export default function Header({
  drawerGroups,
  socials,
}: {
  drawerGroups: DrawerGroup[];
  socials: DrawerLink[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // the section bar and the menu are the same links, flattened
  const links = drawerGroups.flatMap((g) => g.links);
  const sections = links.filter((l) => l.label !== "Home" && l.label !== "About");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // The header carries the mark alone: at masthead size the strapline under
  // the full lockup collapses into a smudge. The menu shows the lockup whole.
  //
  // `width` is a CSS length, so the caller can hand it a clamp() and the mark
  // scales with the viewport at every size rather than stepping at a
  // breakpoint. `sizes` quotes the largest it is ever drawn, so the browser
  // still picks a source sharp enough for a retina screen.
  const Masthead = ({ width, full = false, max }: { width: string; full?: boolean; max: number }) => (
    <Image
      src={full ? "/brand/tht-editorial.png" : "/brand/tht-mark.png"}
      alt="THT Editorial"
      width={full ? 942 : 916}
      height={full ? 634 : 536}
      priority
      sizes={`${max}px`}
      style={{ width, height: "auto" }}
      className="block"
    />
  );

  return (
    <>
      <header className="site-header sticky top-0 z-[60] bg-[rgba(255,255,255,.95)] backdrop-blur-[14px] border-b border-hairline">
        <div className="max-w-[1280px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-[clamp(14px,4vw,54px)] pt-[clamp(10px,1.6vw,18px)] pb-[clamp(8px,1.2vw,14px)]">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="justify-self-start cursor-pointer bg-transparent border-none py-[6px] px-1 flex flex-col gap-[5px]"
          >
            <span className="block h-[1.5px] w-[22px] bg-headline" />
            <span className="block h-[1.5px] w-[22px] bg-headline" />
            <span className="block h-[1.5px] w-[22px] bg-headline" />
          </button>

          <Link href="/#top" aria-label="The Human Thread" className="justify-self-center block">
            <Masthead width="clamp(98px, 7vw + 60px, 150px)" max={150} />
          </Link>

          <Link
            href="/catalogue"
            aria-label="Search"
            className="justify-self-end cursor-pointer p-[6px] text-headline flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Link>
        </div>

        <nav className="border-t border-hairline" aria-label="Sections">
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-[clamp(14px,2.4vw,34px)] px-[clamp(14px,4vw,54px)] py-[10px] overflow-x-auto sectionbar">
            {sections.map((l) => (
              <Link key={l.label} href={l.href} className="sectionlink">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {open && (
        <div className="ov fixed inset-0 z-[100] bg-ivory overflow-y-auto">
          <div className="max-w-[1280px] mx-auto flex items-center gap-[clamp(10px,2vw,18px)] px-[clamp(14px,4vw,54px)] pt-[clamp(10px,1.6vw,18px)] pb-[clamp(8px,1.2vw,14px)] border-b border-hairline">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="modclose shrink-0 cursor-pointer bg-transparent border-none text-[24px] leading-none text-muted p-1"
            >
              ×
            </button>
            <Masthead width="clamp(96px, 5vw + 76px, 128px)" full max={128} />
          </div>

          <div className="max-w-[1280px] mx-auto px-[clamp(14px,4vw,54px)] py-[clamp(20px,3vw,34px)]">
            <div className="max-w-[560px] min-[900px]:max-w-none">
            <nav aria-label="Sections">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="menulink block font-ui text-[13px] font-normal tracking-[.18em] uppercase text-headline py-[clamp(12px,1.7vw,16px)]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = search.trim();
                setOpen(false);
                router.push(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
              }}
              className="mt-[clamp(14px,2vw,20px)] pt-[clamp(18px,2.4vw,26px)] border-t border-ink"
            >
              <label htmlFor="menu-search" className="block font-ui text-[12px] tracking-[.04em] text-muted mb-[10px]">
                Search
              </label>
              <div className="flex items-center gap-2 border-b border-ink pb-[10px]">
                <input
                  id="menu-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-ui text-[14px] text-ink"
                />
                <button type="submit" aria-label="Search" className="shrink-0 cursor-pointer bg-transparent border-none text-headline flex p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="mt-[clamp(26px,3.4vw,38px)] flex items-center justify-center min-[900px]:justify-start gap-[clamp(20px,5vw,34px)]">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="social cursor-pointer text-headline flex"
                >
                  <SocialIcon name={s.label} />
                </a>
              ))}
            </div>

            <div className="mt-[clamp(22px,3vw,30px)] flex items-center justify-center min-[900px]:justify-start gap-[clamp(14px,3vw,24px)]">
              <Link
                href="/terms"
                onClick={() => setOpen(false)}
                className="navlink font-ui text-[10px] tracking-[.16em] uppercase text-muted"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="navlink font-ui text-[10px] tracking-[.16em] uppercase text-muted"
              >
                Privacy
              </Link>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
