import type { Metadata } from "next";
import { Playfair_Display, Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { getCategorySections, catAnchor } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-pf",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-nr",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hg",
});

export const metadata: Metadata = {
  title: "The Human Thread — Magazine · AE",
  description:
    "The Human Thread_AE is an independent digital magazine shaped by stories, culture, identity, and the quiet power of human experience.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const withArticles = new Set((await getCategorySections()).map((s) => s.name));
  const hrefFor = (label: string) => {
    if (label === "Home") return "/#top";
    if (label === "Gallery") return "/#posters";
    if (label === "About") return "/#about";
    return withArticles.has(label) ? `/#${catAnchor(label)}` : `/catalogue?filter=${encodeURIComponent(label)}`;
  };
  const drawerGroups = site.nav.map((g) => ({
    header: g.header,
    links: g.items.map((label) => ({ label, href: hrefFor(label) })),
  }));

  return (
    <html lang="en" className={`${playfair.variable} ${newsreader.variable} ${hanken.variable}`}>
      <body style={{ "--accent": site.accent } as React.CSSProperties}>
        <div className="min-h-0 flex flex-col relative overflow-x-clip">
          <Effects />
          <div className="scrollbar" />
          <Header drawerGroups={drawerGroups} />
          <main className="flex-1 w-full relative">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
