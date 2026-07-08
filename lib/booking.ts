// Shared booking rules — imported by both the scheduler UI and the API routes
// so the client and server always agree on what a valid booking is.

/** Editors' availability: 10:00 AM – 1:00 PM London time (last 30-min slot starts 12:30). */
export const SLOTS = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

export const BOOKING_WINDOW_DAYS = 60;
export const MEETING_MINUTES = 30;
export const MEETING_TIMEZONE = "Europe/London";

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function isValidBookingDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return false; // weekends
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + BOOKING_WINDOW_DAYS);
  return date >= today && date <= max;
}

export function isValidSlot(time: string): boolean {
  return SLOTS.includes(time);
}

export function slotEndTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + MEETING_MINUTES;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
