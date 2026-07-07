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
  const drawerLinks = [
    { label: "Home", href: "/#top" },
    ...(await getCategorySections()).map((s) => ({ label: s.name, href: `/#${catAnchor(s.name)}` })),
    { label: "Posters", href: "/#posters" },
    { label: "About", href: "/#about" },
  ];

  return (
    <html lang="en" className={`${playfair.variable} ${newsreader.variable} ${hanken.variable}`}>
      <body style={{ "--accent": site.accent } as React.CSSProperties}>
        <div className="min-h-0 flex flex-col relative overflow-x-clip">
          <Effects />
          <div className="scrollbar" />
          <Header drawerLinks={drawerLinks} />
          <main className="flex-1 w-full relative">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
