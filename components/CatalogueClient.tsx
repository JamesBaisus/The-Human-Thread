"use client";

import { useState } from "react";
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

  const chips = ["All", ...categories];
  const visible = filter === "All" ? cards : cards.filter((c) => c.category === filter);

  return (
    <>
      <section className="max-w-[1280px] mx-auto px-[clamp(18px,4vw,54px)] pb-[clamp(18px,2.4vw,28px)]">
        <div className="flex items-center gap-[9px] flex-wrap border-y border-hairline py-4">
          {chips.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="chip cursor-pointer font-hanken text-[10.5px] font-semibold tracking-[.16em] uppercase py-[9px] px-[15px] rounded-[2px] border"
                style={{
                  borderColor: active ? "#1c1a17" : "#e3e3e3",
                  background: active ? "#1c1a17" : "transparent",
                  color: active ? "#f5f5f5" : "#4a463f",
                }}
              >
                {c}
              </button>
            );
          })}
          <span className="ml-auto font-hanken text-[10.5px] tracking-[.2em] uppercase text-muted">
            {visible.length} {visible.length === 1 ? "story" : "stories"}
          </span>
        </div>
      </section>
      <section className="max-w-[1280px] mx-auto pt-[clamp(24px,3vw,40px)] pb-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,54px)]">
        <div
          key={filter}
          data-stagger="70"
          className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-[clamp(22px,2.4vw,38px)]"
        >
          {visible.map((c) => (
            <ArticleCard key={c.slug} card={c} large />
          ))}
        </div>
      </section>
    </>
  );
}
