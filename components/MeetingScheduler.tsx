"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BOOKING_WINDOW_DAYS, SLOTS, isoDate } from "@/lib/booking";

const dayLabel = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const timeLabel = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function MeetingScheduler() {
  // Rendered only after mount: the calendar depends on "today", which must not
  // be baked into the prerendered HTML (hydration mismatch).
  const [today, setToday] = useState<Date | null>(null);
  const [tz, setTz] = useState("GMT"); // London time label: GMT in winter, BST in summer
  const [monthOffset, setMonthOffset] = useState(0);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    const zone = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "short" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value;
    if (zone) setTz(zone);
  }, []);

  if (!today) return <div className="min-h-[480px] border-t border-hairline" aria-hidden />;

  if (sent && selDate && selTime) {
    return (
      <div className="border-t border-hairline py-[clamp(40px,6vw,72px)] text-center">
        <div className="font-playfair italic text-[clamp(30px,4vw,52px)] leading-[1.16] text-ink mb-[18px] [text-wrap:balance]">
          Your thread is on the calendar.
        </div>
        <p className="font-hanken text-[11px] font-semibold tracking-[.2em] uppercase text-ink mb-[18px]">
          {dayLabel(selDate)} · {timeLabel(selTime)} {tz} · Online video call
        </p>
        {meetLink ? (
          <p className="text-[16px] leading-[1.6] text-body-1 max-w-[52ch] mx-auto mb-4">
            A Google Calendar invitation with the video link is on its way to your inbox. You can also save the link
            now:{" "}
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="underline text-ink">
              {meetLink.replace("https://", "")}
            </a>
          </p>
        ) : (
          <p className="text-[16px] leading-[1.6] text-body-1 max-w-[46ch] mx-auto mb-4">
            Our editors will confirm by email with a calendar invitation and a video link.
          </p>
        )}
        {demo && (
          <p className="font-hanken text-[10px] tracking-[.14em] uppercase text-muted-2 mb-4">
            Demo mode — calendar connection not configured yet, nothing was scheduled
          </p>
        )}
        <Link
          href="/#top"
          className="pillbtn inline-block cursor-pointer bg-ink text-ondark font-hanken text-[11px] font-semibold tracking-[.2em] uppercase py-[14px] px-[30px] rounded-[2px] mt-3"
        >
          Back to the issue
        </Link>
      </div>
    );
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthLabel = monthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const leadingBlanks = (monthStart.getDay() + 6) % 7; // week starts Monday
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + BOOKING_WINDOW_DAYS);

  const pickDate = (d: Date) => {
    setSelDate(d);
    setSelTime(null);
    setTaken([]);
    setError(null);
    // live availability from the editors' Google Calendar (no-op until connected)
    fetch(`/api/availability?date=${isoDate(d)}`)
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((data: { taken?: string[] }) => setTaken(data.taken ?? []))
      .catch(() => setTaken([]));
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selDate || !selTime || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, date: isoDate(selDate), time: selTime }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; meetLink?: string; demo?: boolean };
      if (!res.ok || !data.ok) {
        setError("We could not arrange the meeting just now — please try again in a moment.");
        return;
      }
      setMeetLink(data.meetLink ?? null);
      setDemo(Boolean(data.demo));
      setSent(true);
    } catch {
      setError("We could not arrange the meeting just now — please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-hairline pt-[clamp(30px,4vw,48px)]">
      <div className="grid grid-cols-[minmax(220px,280px)_1fr_minmax(180px,220px)] max-[900px]:grid-cols-1 gap-[clamp(26px,4vw,54px)]">
        {/* meeting info */}
        <div data-reveal="">
          <div className="font-hanken text-[10px] font-bold tracking-[.28em] uppercase text-ink mb-[14px]">
            Editorial meetings
          </div>
          <h2 className="font-playfair font-medium text-[clamp(22px,2.4vw,30px)] leading-[1.1] text-ink mb-5">
            A conversation with the editors
          </h2>
          <ul className="flex flex-col gap-[10px] font-hanken text-[11px] font-semibold tracking-[.16em] uppercase text-body-2">
            <li className="flex items-center gap-[10px]">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" /> 30 minutes
            </li>
            <li className="flex items-center gap-[10px]">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" /> Google Meet video call
            </li>
            <li className="flex items-center gap-[10px]">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" /> London time · {tz}
            </li>
          </ul>
          <p className="font-playfair italic text-[15px] leading-[1.6] text-muted mt-6 max-w-[30ch]">
            Bring your story, your images, or simply an idea — we listen first.
          </p>
          {selDate && (
            <div className="mt-7 pt-5 border-t border-hairline">
              <div className="font-hanken text-[9px] font-bold tracking-[.22em] uppercase text-muted-2 mb-2">
                Selected
              </div>
              <div className="font-playfair font-medium text-[18px] leading-[1.3] text-ink">
                {dayLabel(selDate)}
                {selTime && <span> · {timeLabel(selTime)}</span>}
              </div>
            </div>
          )}
        </div>

        {/* calendar */}
        <div data-reveal="" data-reveal-delay="70">
          <div className="flex items-center justify-between mb-5">
            <div className="font-playfair font-medium text-[20px] text-ink">{monthLabel}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMonthOffset((o) => o - 1)}
                disabled={monthOffset === 0}
                aria-label="Previous month"
                className="carbtn w-9 h-9 rounded-full border-none bg-hairline text-ink text-[14px] cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-default"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((o) => o + 1)}
                disabled={monthOffset >= 2}
                aria-label="Next month"
                className="carbtn w-9 h-9 rounded-full border-none bg-hairline text-ink text-[14px] cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-default"
              >
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-[6px] mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="text-center font-hanken text-[9px] font-bold tracking-[.18em] uppercase text-muted-2 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[6px]">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`b${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1);
              const weekend = date.getDay() === 0 || date.getDay() === 6;
              const disabled = weekend || date < today || date > maxDate;
              const selected = selDate !== null && isoDate(date) === isoDate(selDate);
              return (
                <button
                  key={i}
                  type="button"
                  data-day={i + 1}
                  disabled={disabled}
                  onClick={() => pickDate(date)}
                  className={`aspect-square rounded-[2px] font-hanken text-[13px] transition-colors cursor-pointer ${
                    selected
                      ? "bg-ink text-ondark font-bold"
                      : disabled
                        ? "text-[#c9c5bd] cursor-default"
                        : "bg-soft text-ink font-semibold hover:bg-hairline"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* time slots */}
        <div data-reveal="" data-reveal-delay="140">
          <div className="font-hanken text-[10px] font-bold tracking-[.22em] uppercase text-body-2 mb-4 min-h-[1em]">
            {selDate ? dayLabel(selDate) : "Time"}
          </div>
          {selDate ? (
            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1 max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:max-h-none">
              {SLOTS.map((t) => {
                const busy = taken.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    data-slot={t}
                    disabled={busy}
                    onClick={() => setSelTime(t)}
                    className={`rounded-[2px] py-3 px-4 font-hanken text-[12px] font-semibold tracking-[.12em] transition-colors text-center max-[900px]:flex-none ${
                      busy
                        ? "bg-soft text-muted-2 line-through cursor-default"
                        : selTime === t
                          ? "bg-ink text-ondark cursor-pointer"
                          : "bg-soft text-ink hover:bg-hairline cursor-pointer"
                    }`}
                  >
                    {timeLabel(t)}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="font-playfair italic text-[15px] leading-[1.6] text-muted-2">
              Select a day to see the available times.
            </p>
          )}
        </div>
      </div>

      {/* details + confirm */}
      {selDate && selTime && (
        <form onSubmit={confirm} className="mt-[clamp(30px,4vw,48px)] border-t border-hairline pt-[clamp(26px,3.4vw,40px)]">
          <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-[clamp(22px,3vw,36px)] mb-[clamp(22px,3vw,32px)]">
            <div>
              <label className="block font-hanken text-[10.5px] font-semibold tracking-[.2em] uppercase text-body-2 mb-3">
                Your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="inqfield"
              />
            </div>
            <div>
              <label className="block font-hanken text-[10.5px] font-semibold tracking-[.2em] uppercase text-body-2 mb-3">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                required
                className="inqfield"
              />
            </div>
          </div>
          <div>
            <label className="block font-hanken text-[10.5px] font-semibold tracking-[.2em] uppercase text-body-2 mb-3">
              What would you like to talk about?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="A story, a collaboration, a feature — a few lines are enough…"
              rows={4}
              className="inqfield resize-y leading-[1.66] !py-[14px]"
            />
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap mt-[clamp(26px,3.4vw,40px)] border-t border-hairline pt-[clamp(22px,2.8vw,32px)]">
            <span className="font-hanken text-[10px] tracking-[.14em] uppercase text-muted-2">
              {dayLabel(selDate)} · {timeLabel(selTime)} {tz} · 30 min · Google Meet
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="pillbtn cursor-pointer border-none bg-ink text-ondark font-hanken text-[11px] font-semibold tracking-[.2em] uppercase py-[15px] px-9 rounded-[2px] disabled:opacity-60 disabled:cursor-default"
            >
              {submitting ? "Arranging…" : "Confirm meeting"}
            </button>
          </div>
          {error && (
            <p className="font-hanken text-[11px] tracking-[.08em] text-[#a33] mt-4 text-right" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
