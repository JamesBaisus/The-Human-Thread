"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/consent";
import { clearAllReading } from "@/lib/reading";

/**
 * First-visit consent banner. Honest by construction: Accept switches on the
 * "pick up where you left off" memory (and keeps the cookieless visit stats);
 * Decline turns both off and wipes anything already stored. The choice itself
 * is remembered so the banner only ever asks once.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() == null) setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    setConsent("accepted");
    setOpen(false);
  };

  const decline = () => {
    setConsent("declined");
    clearAllReading();
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-[clamp(16px,3vw,30px)] z-[120] flex justify-center px-4 pointer-events-none">
      <div
        role="dialog"
        aria-label="Cookies and storage"
        className="pointer-events-auto w-full max-w-[560px] bg-ink text-ondark rounded-[3px] shadow-[0_12px_44px_rgba(0,0,0,.28)] px-[clamp(18px,3vw,26px)] py-[clamp(16px,2.4vw,22px)] animate-[modup_0.5s_cubic-bezier(0.16,0.8,0.3,1)_both]"
      >
        <div className="font-hanken text-[9px] font-bold tracking-[.24em] uppercase text-[rgba(245,245,245,.55)] mb-[10px]">
          Your data, plainly
        </div>
        <p className="font-playfair text-[15.5px] leading-[1.55] text-[rgba(245,245,245,.92)]">
          No tracking cookies here. Accept, and the site may remember where you left off in a story —
          kept in your browser, never sent to us. Our visit stats are cookieless and anonymous.
        </p>
        <div className="flex items-center gap-3 flex-wrap mt-[18px]">
          <button
            onClick={accept}
            className="cursor-pointer font-hanken text-[10px] font-bold tracking-[.16em] uppercase bg-ondark text-ink rounded-[2px] py-[10px] px-5 transition-transform hover:-translate-y-px"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="cursor-pointer font-hanken text-[10px] font-bold tracking-[.16em] uppercase text-ondark border border-[rgba(245,245,245,.35)] rounded-[2px] py-[10px] px-5 transition-colors hover:border-ondark"
          >
            Decline
          </button>
          <Link
            href="/privacy"
            className="navlink cursor-pointer ml-auto font-hanken text-[9.5px] font-semibold tracking-[.18em] uppercase text-[rgba(245,245,245,.6)] hover:text-ondark transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
