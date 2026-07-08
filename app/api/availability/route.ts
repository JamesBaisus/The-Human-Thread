import { NextResponse } from "next/server";
import { isValidBookingDate } from "@/lib/booking";
import { isCalendarConfigured, takenSlots } from "@/lib/google";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!isValidBookingDate(date)) {
    return NextResponse.json({ taken: [] }, { status: 400 });
  }
  if (!isCalendarConfigured()) {
    return NextResponse.json({ taken: [] });
  }
  try {
    return NextResponse.json({ taken: await takenSlots(date) });
  } catch (err) {
    console.error("availability failed:", err);
    // On failure, show all slots rather than blocking the booking flow.
    return NextResponse.json({ taken: [] });
  }
}
