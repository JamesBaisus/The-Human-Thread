// Server-side Google Calendar integration (used by the /api/book and
// /api/availability route handlers — never imported in client code).
//
// Required environment variables (see .env.example / README):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — OAuth client of the site owner's Google Cloud project
//   GOOGLE_REFRESH_TOKEN                   — minted once for the owner's Google account
//   GOOGLE_CALENDAR_ID                     — optional, defaults to "primary"

import { MEETING_TIMEZONE, SLOTS, slotEndTime } from "@/lib/booking";

export function isCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN
  );
}

async function accessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

const calendarId = () => encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");

/**
 * London wall-clock time for a date+slot, as a UTC Date (handles GMT/BST).
 * Both renderings are parsed with the same local-time rules, so the offset
 * is correct regardless of the server's own timezone.
 */
function slotToUtc(date: string, time: string): Date {
  const guess = new Date(`${date}T${time}:00Z`);
  const asUtc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  const asLondon = new Date(guess.toLocaleString("en-US", { timeZone: MEETING_TIMEZONE }));
  const offsetMs = asLondon.getTime() - asUtc.getTime();
  return new Date(guess.getTime() - offsetMs);
}

export type BookingRequest = {
  name: string;
  email: string;
  topic: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm, one of SLOTS
};

/** Creates the calendar event with an auto-generated Google Meet link and emails invitations. */
export async function createMeetingEvent(req: BookingRequest): Promise<{ meetLink?: string; eventLink?: string }> {
  const token = await accessToken();
  const event = {
    summary: `The Human Thread — Editorial meeting with ${req.name}`,
    description:
      `Booked via thehumanthread inquire page.\n\n` +
      `Name: ${req.name}\nEmail: ${req.email}\n\n` +
      (req.topic ? `Topic:\n${req.topic}\n` : ""),
    start: { dateTime: `${req.date}T${req.time}:00`, timeZone: MEETING_TIMEZONE },
    end: { dateTime: `${req.date}T${slotEndTime(req.time)}:00`, timeZone: MEETING_TIMEZONE },
    attendees: [{ email: req.email, displayName: req.name }],
    conferenceData: {
      createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
    },
    reminders: { useDefault: true },
  };
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId()}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) throw new Error(`Google Calendar insert failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { hangoutLink?: string; htmlLink?: string };
  return { meetLink: data.hangoutLink, eventLink: data.htmlLink };
}

/** Slot start times already busy on the owner's calendar for a given day. */
export async function takenSlots(date: string): Promise<string[]> {
  const token = await accessToken();
  const dayStart = slotToUtc(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items: [{ id: process.env.GOOGLE_CALENDAR_ID || "primary" }],
    }),
  });
  if (!res.ok) throw new Error(`Google freeBusy failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as {
    calendars: Record<string, { busy: { start: string; end: string }[] }>;
  };
  const busy = Object.values(data.calendars)[0]?.busy ?? [];
  return SLOTS.filter((slot) => {
    const start = slotToUtc(date, slot);
    const end = slotToUtc(date, slotEndTime(slot));
    return busy.some((b) => start < new Date(b.end) && end > new Date(b.start));
  });
}
