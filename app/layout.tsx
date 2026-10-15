import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { getCategorySections, catAnchor } from "@/lib/content";
import Header from "@/components/Header";
import ContinueReading from "@/components/ContinueReading";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsGate from "@/components/AnalyticsGate";

// Display: the Didone the masthead is drawn in, for every headline.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700", "900"],
  variable: "--font-pf",
  display: "swap",
});

// Reading: a serif for body copy, the way a magazine sets its pages.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
  variable: "--font-sr",
  display: "swap",
});

// Interface: the sans that carries the nav, the category labels and the
// small tracked furniture around the editorial.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-ss",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Human Thread Journal · AE",
  description:
    "The Human Thread_AE is an independent digital journal shaped by stories, culture, identity, and the quiet power of human experience.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const withArticles = new Set((await getCategorySections()).map((s) => s.name));
  const hrefFor = (label: string) => {
    if (label === "Home") return "/#top";
    if (label === "THT Edit") return "/#tht-edit";
    if (label === "Gallery") return "/#posters";
    if (label === "About") return "/#about";
    if (label === "Inquire") return "/inquire";
    return withArticles.has(label) ? `/#${catAnchor(label)}` : `/catalogue?filter=${encodeURIComponent(label)}`;
  };
  const drawerGroups = site.nav.map((g) => ({
    header: g.header,
    links: g.items.map((label) => ({ label, href: hrefFor(label) })),
  }));

  return (
    <html lang="en" className={`${sourceSans.variable} ${playfair.variable} ${sourceSerif.variable}`}>
      <body style={{ "--accent": site.accent } as React.CSSProperties}>
        <div className="min-h-0 flex flex-col relative overflow-x-clip">
          <Effects />
          <div className="scrollbar" />
          <Header drawerGroups={drawerGroups} socials={[...site.socials]} />
          <ContinueReading />
          <main className="flex-1 w-full relative">{children}</main>
          <Footer />
        </div>
        <CookieConsent />
        <AnalyticsGate />
      </body>
    </html>
  );
}
