import Link from "next/link";
import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="border-t border-hairline py-[clamp(34px,4vw,54px)] px-[clamp(18px,4vw,54px)]">
      <div className="max-w-[1280px] mx-auto flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="font-playfair font-black text-[clamp(22px,2.4vw,30px)] tracking-[.005em] text-ink">
            THE HUMAN THREAD
          </div>
          <div className="font-hanken text-[9px] font-semibold tracking-[.4em] text-muted mt-[6px]">MAGAZINE · AE</div>
        </div>
        <div className="flex gap-6 items-center font-hanken text-[10.5px] tracking-[.2em] uppercase text-muted">
          <Link href="/#top" className="navlink cursor-pointer">
            Home
          </Link>
          <Link href="/catalogue" className="navlink cursor-pointer">
            Articles
          </Link>
          <Link href="/#about" className="navlink cursor-pointer">
            About Us
          </Link>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="navlink cursor-pointer">
            Instagram
          </a>
          <span>© 2026 The Human Thread</span>
        </div>
      </div>
    </footer>
  );
}
