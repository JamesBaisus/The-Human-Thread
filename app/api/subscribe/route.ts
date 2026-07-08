import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter signup. Provider is chosen by whichever env vars are present:
 *  - BUTTONDOWN_API_KEY                        → Buttondown
 *  - MAILCHIMP_API_KEY + MAILCHIMP_AUDIENCE_ID → Mailchimp
 *  - neither                                   → demo mode (accepted, not stored)
 */
export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().slice(0, 200);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const buttondown = process.env.BUTTONDOWN_API_KEY;
  const mcKey = process.env.MAILCHIMP_API_KEY;
  const mcList = process.env.MAILCHIMP_AUDIENCE_ID;

  try {
    if (buttondown) {
      const res = await fetch("https://api.buttondown.com/v1/subscribers", {
        method: "POST",
        headers: { Authorization: `Token ${buttondown}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: email }),
      });
      // 201 created; 400 usually means already subscribed — treat as success.
      if (res.ok || res.status === 400) return NextResponse.json({ ok: true });
      console.error("buttondown failed:", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "provider_error" }, { status: 502 });
    }

    if (mcKey && mcList) {
      const dc = mcKey.split("-").pop();
      const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${mcList}/members`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${mcKey}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_address: email, status: "subscribed" }),
      });
      if (res.ok) return NextResponse.json({ ok: true });
      const detail = (await res.json().catch(() => ({}))) as { title?: string };
      if (detail.title === "Member Exists") return NextResponse.json({ ok: true });
      console.error("mailchimp failed:", res.status, detail);
      return NextResponse.json({ ok: false, error: "provider_error" }, { status: 502 });
    }
  } catch (err) {
    console.error("subscribe failed:", err);
    return NextResponse.json({ ok: false, error: "provider_error" }, { status: 502 });
  }

  // No provider configured yet — accept so the UI works; nothing is stored.
  return NextResponse.json({ ok: true, demo: true });
}
