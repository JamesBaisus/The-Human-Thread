import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Editor — The Human Thread",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="pg">
      <section className="max-w-[760px] mx-auto pt-[clamp(40px,6vw,80px)] pb-[clamp(16px,2vw,28px)] px-[clamp(18px,4vw,40px)]">
        <div className="font-ui text-[11px] font-black tracking-[.3em] uppercase text-ink mb-4">
          The editor&apos;s desk
        </div>
        <h1 className="font-display font-black text-[clamp(40px,6vw,72px)] leading-[.95] tracking-[-.015em]">
          Add an article
        </h1>
        <p className="font-display italic text-[clamp(16px,1.8vw,21px)] leading-[1.45] text-body-1 mt-4 max-w-[52ch]">
          Fill in the story and publish — the magazine handles typesetting, image layouts, and ordering by itself.
        </p>
      </section>
      <section className="max-w-[760px] mx-auto pt-2 pb-[clamp(56px,8vw,100px)] px-[clamp(18px,4vw,40px)]">
        <AdminPanel />
      </section>
    </div>
  );
}
