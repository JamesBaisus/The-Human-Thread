import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { site } from "@/content/site";

/**
 * The foot of the paper, as the reference sets it: the socials first, then a
 * line saying what the publication covers, the contact column, and the legal
 * sentence last in small grey type.
 */
export default function Footer() {
  return (
    <footer className="border-t border-ink pt-[clamp(30px,3.4vw,48px)] pb-[clamp(26px,3vw,40px)] px-[clamp(18px,4vw,54px)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center text-center gap-[clamp(16px,2vw,24px)]">
          <Link href="/#top" aria-label="THT Editorial" className="block">
            <Wordmark scale="clamp(13px, 1.3vw + 8px, 21px)" />
          </Link>

          <div className="flex items-center justify-center gap-[clamp(14px,2.4vw,28px)] flex-wrap">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="navlink cursor-pointer font-ui text-[10px] font-black tracking-[.22em] uppercase text-ink"
              >
                {s.label}
              </a>
            ))}
          </div>

          <p className="max-w-[640px] text-[14px] leading-[1.65] text-muted">
            Human stories, culture, art and fashion from the Emirates and beyond, told with the person behind the
            work kept in the frame, on thehumanthread.ae
          </p>
        </div>

        <nav
          aria-label="Contact"
          className="mt-[clamp(26px,3vw,40px)] pt-[clamp(18px,2.2vw,26px)] border-t border-hairline flex items-center justify-center gap-[clamp(12px,2vw,26px)] flex-wrap"
        >
          <Link href="/#about" className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted">
            About Us
          </Link>
          <Link href="/catalogue" className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted">
            All Stories
          </Link>
          <Link href="/inquire" className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted">
            Inquire
          </Link>
          <Link href="/privacy" className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted">
            Privacy Policy
          </Link>
          <Link href="/terms" className="navlink font-ui text-[10px] tracking-[.18em] uppercase text-muted">
            User Agreement
          </Link>
        </nav>

        <p className="mt-[clamp(18px,2.2vw,26px)] text-center text-[11.5px] leading-[1.7] text-muted-2 max-w-[820px] mx-auto">
          © 2026 The Human Thread_AE. All rights reserved. Use of this site constitutes acceptance of our User
          Agreement and Privacy Policy. The material on this site may not be reproduced, distributed, transmitted,
          cached or otherwise used, except with prior written permission.
        </p>
      </div>
    </footer>
  );
}
