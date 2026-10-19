import type { Metadata } from "next";
import Link from "next/link";
import MeetingScheduler from "@/components/MeetingScheduler";

export const metadata: Metadata = {
  title: "Inquire · The Human Thread",
  description: "Arrange an online meeting with the editors of The Human Thread.",
};

export default function InquirePage() {
  return (
    <div className="pg">
      <section className="max-w-[1000px] mx-auto pt-[clamp(40px,6vw,86px)] pb-[clamp(20px,3vw,34px)] px-[clamp(18px,4vw,54px)]">
        <Link href="/#top" className="navlink cursor-pointer font-ui text-[11px] tracking-[.2em] uppercase text-muted">
          ← Back to the issue
        </Link>
        <div className="font-ui text-[11px] font-black tracking-[.3em] uppercase text-ink mt-[clamp(26px,3.4vw,40px)] mb-4">
          Arrange an online meeting
        </div>
        <h1 className="font-display font-medium text-[clamp(48px,8vw,104px)] leading-[.9] tracking-[-.015em]">
          Inquire
        </h1>
        <p className="font-display italic text-[clamp(19px,2.2vw,27px)] leading-[1.4] text-body-1 mt-[22px] max-w-[46ch]">
          Book a time with the editors: a thirty-minute online conversation about your story, a collaboration, or a
          feature in the issue.
        </p>
      </section>

      <section className="max-w-[1000px] mx-auto pt-[clamp(20px,3vw,36px)] pb-[clamp(56px,8vw,110px)] px-[clamp(18px,4vw,54px)]">
        <MeetingScheduler />
      </section>
    </div>
  );
}
