"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global scroll effects, matching the design prototype:
 * - [data-reveal] fade/slide-in via IntersectionObserver (+ data-reveal-delay / parent data-stagger)
 * - [data-parallax] translate on scroll (e.g. the "13" watermark)
 * - top scroll progress bar (.scrollbar)
 * - header shadow once scrolled
 */
export default function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();
    let parallaxEls: HTMLElement[] = [];

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((en) => {
                if (en.isIntersecting) {
                  en.target.classList.add("in");
                  io?.unobserve(en.target);
                }
              });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
          )
        : null;

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const delay = el.getAttribute("data-reveal-delay");
        if (delay) {
          el.style.transitionDelay = delay + "ms";
        } else {
          const par = el.parentElement;
          if (par && par.hasAttribute("data-stagger")) {
            const i = Array.prototype.indexOf.call(par.children, el);
            const step = parseInt(par.getAttribute("data-stagger") || "70", 10) || 70;
            el.style.transitionDelay = i * step + "ms";
          }
        }
        if (reduced) {
          el.classList.add("in");
          return;
        }
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add("in");
        else if (io) io.observe(el);
        else el.classList.add("in");
      });
      parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    };

    const revealVisible = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add("in");
      });
    };

    const applyParallax = () => {
      if (reduced) return;
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax") || "0.15") || 0.15;
        const base = el.getAttribute("data-parallax-base") || "";
        const r = el.getBoundingClientRect();
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.transform = (base ? base + " " : "") + "translateY(" + (-offset * speed).toFixed(1) + "px)";
      });
    };

    const updateUI = () => {
      revealVisible();
      applyParallax();
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, (window.scrollY || 0) / max));
      const bar = document.querySelector<HTMLElement>(".scrollbar");
      if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
      const header = document.querySelector("header.site-header");
      if (header) header.classList.toggle("scrolled", (window.scrollY || 0) > 14);
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          updateUI();
          raf = 0;
        });
    };

    scan();
    updateUI();

    let scanT: ReturnType<typeof setTimeout>;
    const mo = new MutationObserver(() => {
      clearTimeout(scanT);
      scanT = setTimeout(() => {
        scan();
        revealVisible();
      }, 30);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const timer = setInterval(updateUI, 150);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      io?.disconnect();
      mo.disconnect();
      clearTimeout(scanT);
      clearInterval(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
