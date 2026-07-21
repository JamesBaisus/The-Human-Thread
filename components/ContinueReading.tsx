"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SimpleAmp from "@/components/SimpleAmp";
import { getLastRead, type LastRead } from "@/lib/reading";

const DISMISS_KEY = "tht:continue-dismissed";

/**
 * Site-wide affordance for returning readers: a slim bar under the header that
 * reopens the last article they were partway through. Renders nothing on the
 * server, nothing for first-time visitors, nothing on the very article it
 * points to, and nothing once dismissed for that article this session — so it
 * only ever appears when it's genuinely useful.
 */
export default function ContinueReading() {
  const pathname = usePathname();
  const [last, setLast] = useState<LastRead | null>(null);

  // Re-check on every navigation, since "last read" updates as they read.
  useEffect(() => {
    const entry = getLastRead();
    if (!entry) return setLast(null);
    if (pathname === `/article/${entry.slug}`) return setLast(null);
    let dismissed: string | null = null;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY);
    } catch {
      /* sessionStorage unavailable — just show it */
    }
    setLast(dismissed === entry.slug ? null : entry);
  }, [pathname]);

  if (!last) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, last.slug);
    } catch {
      /* no-op */
    }
    setLast(null);
  };

  return (
    <div className="border-b border-hairline bg-[rgba(255,255,255,.92)] backdrop-blur-[14px] animate-[fadeUp_0.45s_ease_both]">
      <div className="max-w-[1280px] mx-auto flex items-center gap-3 px-[clamp(18px,4vw,54px)] py-[9px]">
        <Link
          href={`/article/${last.slug}`}
          className="rellink group flex-1 min-w-0 flex items-center gap-[clamp(10px,2vw,20px)] cursor-pointer -mx-2 px-2 py-1 rounded-[2px]"
        >
          <span className="flex-none font-hanken text-[9px] font-bold tracking-[.24em] uppercase text-muted">
            Continue reading
          </span>
          <span className="flex-none h-4 w-px bg-hairline max-[560px]:hidden" />
          <span className="flex-none font-hanken text-[8.5px] font-bold tracking-[.18em] uppercase text-muted-2 max-[560px]:hidden">
            {last.category} · {Math.round(last.pct * 100)}%
          </span>
          <span className="flex-1 min-w-0 font-playfair font-medium text-[clamp(14px,1.6vw,17px)] leading-tight text-ink truncate">
            <SimpleAmp text={last.title} />
          </span>
          <span className="relarrow flex-none font-hanken text-[14px] text-ink">→</span>
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-none text-muted-2 hover:text-ink px-1 text-[18px] leading-none cursor-pointer transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
