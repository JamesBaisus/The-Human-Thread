import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/content/site";
import { getCatalogue, isLatestInCategory } from "@/lib/content";
import CatalogueClient from "@/components/CatalogueClient";

export const metadata: Metadata = {
  title: "Articles · The Human Thread",
  description: "Every story in the issue: portraits, essays and conversations.",
};

export default async function CataloguePage() {
  const catalogue = await getCatalogue();
  const cards = await Promise.all(
    catalogue.map(async (a) => ({
      slug: a.slug,
      category: a.category,
      name: a.name,
      role: a.role,
      title: a.title,
      deck: a.deck,
      cover: a.cover,
      coverBlur: a.coverBlur,
      latest: await isLatestInCategory(a),
    }))
  );

  return (
    <div className="pg">
      <section className="max-w-[1280px] mx-auto pt-[clamp(40px,6vw,86px)] pb-[clamp(20px,3vw,34px)] px-[clamp(18px,4vw,54px)]">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="font-ui text-[11px] font-black tracking-[.3em] uppercase text-muted mb-4">
              The catalogue
            </div>
            <h1 className="font-display font-black text-[clamp(48px,9vw,120px)] leading-[.9] tracking-[-.015em]">
              Articles
            </h1>
          </div>
          <p className="max-w-[34ch] text-[16px] leading-[1.6] text-body-1">
            Every story in the issue: portraits, essays and conversations. Choose a thread to follow.
          </p>
        </div>
      </section>
      <Suspense>
        <CatalogueClient cards={cards} categories={[...site.categories]} />
      </Suspense>
    </div>
  );
}
