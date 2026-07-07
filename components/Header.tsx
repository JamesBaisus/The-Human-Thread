"use client";

import { useState } from "react";
import Link from "next/link";

export type DrawerLink = { label: string; href: string };
export type DrawerGroup = { header: string | null; links: DrawerLink[] };

export default function Header({
  drawerGroups,
  socials,
}: {
  drawerGroups: DrawerGroup[];
  socials: DrawerLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="site-header sticky top-0 z-[60] bg-[rgba(255,255,255,.92)] backdrop-blur-[14px] border-b border-hairline">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-6 py-4 px-[clamp(18px,4vw,54px)]">
          <div className="flex items-center gap-[clamp(12px,1.6vw,18px)] flex-none">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="cursor-pointer bg-transparent border-none py-[6px] px-1 flex flex-col gap-[5px]"
            >
              <span className="block h-[1.6px] w-6 bg-ink" />
              <span className="block h-[1.6px] w-6 bg-ink" />
              <span className="block h-[1.6px] w-6 bg-ink" />
            </button>
            <Link href="/#top" className="block leading-[.86]">
              <div className="font-playfair font-black text-[clamp(19px,2vw,26px)] tracking-[.005em] text-ink">
                THE HUMAN THREAD
              </div>
              <div className="font-hanken text-[8.5px] font-semibold tracking-[.44em] text-muted mt-1 pl-[2px]">
                MAGAZINE · AE
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-[clamp(10px,1.6vw,20px)] flex-none">
            <Link href="/catalogue" aria-label="Search" className="cursor-pointer p-[6px] text-ink flex">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </Link>
            <Link
              href="/inquire"
              className="inqbtn cursor-pointer text-ink font-hanken text-[10.5px] font-semibold tracking-[.16em] uppercase py-2 px-1"
            >
              Inquire
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="ov fixed inset-0 z-[150] bg-[rgba(20,18,16,.42)] backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <aside
            className="navdrawer absolute left-0 top-0 h-full w-[min(330px,84vw)] bg-white shadow-[24px_0_60px_-30px_rgba(20,18,16,.5)] flex flex-col p-[clamp(24px,3vw,34px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-[clamp(26px,3.4vw,40px)]">
              <div className="leading-[.86]">
                <div className="font-playfair font-black text-[17px] tracking-[.005em] text-ink">THE HUMAN THREAD</div>
                <div className="font-hanken text-[8px] font-semibold tracking-[.4em] text-muted-2 mt-1">
                  MAGAZINE · AE
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer text-ink text-[26px] leading-none px-[2px] -mt-[2px]"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {drawerGroups.map((g, gi) => (
                <div key={gi}>
                  {g.header && (
                    <div className="font-hanken text-[9px] font-bold tracking-[.3em] uppercase text-muted-2 pt-[clamp(20px,2.6vw,30px)] pb-[6px]">
                      {g.header}
                    </div>
                  )}
                  {g.links.map((d) => (
                    <Link
                      key={d.label}
                      href={d.href}
                      onClick={() => setOpen(false)}
                      className="drawerlink cursor-pointer block font-playfair font-medium text-[24px] leading-none text-ink py-[clamp(10px,1.3vw,14px)] border-b border-ph"
                    >
                      {d.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-5 mt-5 border-t border-hairline">
              <div className="flex gap-x-5 gap-y-2 flex-wrap mb-4">
                <Link
                  href="/terms"
                  onClick={() => setOpen(false)}
                  className="font-hanken text-[9.5px] font-semibold tracking-[.16em] uppercase text-muted transition-colors hover:text-ink"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  onClick={() => setOpen(false)}
                  className="font-hanken text-[9.5px] font-semibold tracking-[.16em] uppercase text-muted transition-colors hover:text-ink"
                >
                  Privacy Policy
                </Link>
              </div>
              <div className="flex gap-x-5 gap-y-2 flex-wrap">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-hanken text-[10px] font-bold tracking-[.18em] uppercase text-body-2 transition-colors hover:text-accent"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
