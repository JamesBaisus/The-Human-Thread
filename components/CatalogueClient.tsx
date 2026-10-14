"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ArticleCard, { type ArticleCardData } from "@/components/ArticleCard";

export default function CatalogueClient({
  cards,
  categories,
}: {
  cards: ArticleCardData[];
  categories: string[];
}) {
  const params = useSearchParams();
  const initial = params.get("filter");
  const [filter, setFilter] = useState(initial && categories.includes(initial) ? initial : "All");
  // Seeded by the menu's search field, then editable here.
  const [query, setQuery] = useState(params.get("q") ?? "");

  const chips = ["All", ...categories];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (filter !== "All" && c.category !== filter) return false;
      if (!q) return true;
      return [c.title, c.name, c.category, c.deck, c.role].some((f) => (f ?? "").toLowerCase().includes(q));
    });
  }, [cards, filter, query]);

  return (
    <>
      <section className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pb-[clamp(18px,2.4vw,28px)]">
        <div className="border-y border-hairline py-4">
          <label className="flex items-center gap-3 pb-4 mb-4 border-b border-hairline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-muted">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, people and subjects"
              aria-label="Search stories"
              className="w-full bg-transparent border-none outline-none font-ui text-[14px] tracking-[.02em] text-ink"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 cursor-pointer bg-transparent border-none font-ui text-[10px] font-black tracking-[.18em] uppercase text-muted"
              >
                Clear
              </button>
            )}
          </label>

          <div className="flex items-center gap-[9px] flex-wrap">
            {chips.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className="chip cursor-pointer font-ui text-[10.5px] font-black tracking-[.16em] uppercase py-[9px] px-[15px] rounded-[2px] border"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--color-hairline)",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "#ffffff" : "var(--color-body-2)",
                  }}
                >
                  {c}
                </button>
              );
            })}
            <span className="ml-auto font-ui text-[10.5px] tracking-[.2em] uppercase text-muted">
              {visible.length} {visible.length === 1 ? "story" : "stories"}
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto pt-[clamp(24px,3vw,40px)] pb-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,54px)]">
        {visible.length === 0 ? (
          <p className="py-[clamp(30px,5vw,60px)] text-center text-[16px] text-muted">
            Nothing matches “{query}”{filter !== "All" ? ` in ${filter}` : ""}.
          </p>
        ) : (
          <div
            key={`${filter}-${query}`}
            data-stagger="70"
            className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-[clamp(22px,2.4vw,38px)]"
          >
            {visible.map((c) => (
              <ArticleCard key={c.slug} card={c} large />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
