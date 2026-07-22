"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { analyticsAllowed, CONSENT_EVENT } from "@/lib/consent";

/**
 * Mounts Vercel Analytics only while the visitor hasn't declined on the
 * consent banner. The stats are cookieless and anonymous either way, but a
 * "Decline" button that doesn't decline anything would be theatre.
 */
export default function AnalyticsGate() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const update = () => setOn(analyticsAllowed());
    update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);

  return on ? <Analytics /> : null;
}
