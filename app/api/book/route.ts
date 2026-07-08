import { NextResponse } from "next/server";
import { isValidBookingDate, isValidSlot } from "@/lib/booking";
import { createMeetingEvent, isCalendarConfigured } from "@/lib/google";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string; topic?: string; date?: string; time?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 200);
  const email = (body.email ?? "").trim().slice(0, 200);
  const topic = (body.topic ?? "").trim().slice(0, 4000);
  const date = (body.date ?? "").trim();
  const time = (body.time ?? "").trim();

  if (!name || !EMAIL_RE.test(email) || !isValidBookingDate(date) || !isValidSlot(time)) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  // Calendar not connected yet (env vars missing): accept the request so the
  // UI flow works, but tell the client nothing was actually scheduled.
  if (!isCalendarConfigured()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const { meetLink } = await createMeetingEvent({ name, email, topic, date, time });
    return NextResponse.json({ ok: true, meetLink });
  } catch (err) {
    console.error("booking failed:", err);
    return NextResponse.json({ ok: false, error: "calendar_error" }, { status: 502 });
  }
}
