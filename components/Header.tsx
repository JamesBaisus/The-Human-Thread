"use client";

import { useEffect, useState } from "react";
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
export default function Header({
  drawerGroups,
  socials,
}: {
  drawerGroups: DrawerGroup[];
  socials: DrawerLink[];
}) {
  const [open, setOpen] = useState(false);

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
  const Masthead = ({ width, full = false }: { width: number; full?: boolean }) => (
    <Image
      src={full ? "/brand/tht-editorial.png" : "/brand/tht-mark.png"}
      alt="THT Editorial"
      width={full ? 942 : 916}
      height={full ? 634 : 536}
      priority
      sizes={`${width}px`}
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
            <span className="block max-[560px]:hidden">
              <Masthead width={168} />
            </span>
            <span className="hidden max-[560px]:block">
              <Masthead width={116} />
            </span>
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
          <div className="max-w-[1280px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-[clamp(14px,4vw,54px)] pt-[clamp(10px,1.6vw,18px)] pb-[clamp(8px,1.2vw,14px)] border-b border-hairline">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="modclose justify-self-start cursor-pointer bg-transparent border-none text-[26px] leading-none text-headline p-1"
            >
              ×
            </button>
            <span className="justify-self-center">
              <Masthead width={168} full />
            </span>
            <span />
          </div>

          <div className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] py-[clamp(26px,4vw,54px)]">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="menulink block font-display font-black text-[clamp(26px,4.4vw,52px)] leading-[1.18] text-headline py-[clamp(6px,1vw,10px)]"
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-[clamp(28px,4vw,46px)] pt-[clamp(18px,2.4vw,26px)] border-t border-hairline flex items-center gap-[clamp(16px,3vw,30px)] flex-wrap">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inqbtn cursor-pointer font-ui text-[10.5px] font-black tracking-[.22em] uppercase text-accent"
                >
                  {s.label}
                </a>
              ))}
              <span className="flex-1" />
              <Link
                href="/terms"
                onClick={() => setOpen(false)}
                className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
