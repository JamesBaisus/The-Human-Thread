import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy · The Human Thread",
  description: "Privacy Policy for The Human Thread_AE.",
};

const sections = [
  {
    h: "What we collect",
    ps: [
      "We collect only what you choose to give us: your name, email, and the material you send if you submit through the Inquire page; and your name, email, and chosen time if you book an editorial meeting.",
      "Like nearly every website, our hosting provider also processes basic technical logs (such as IP addresses and browser type) to serve pages securely and reliably.",
    ],
  },
  {
    h: "How we use it",
    ps: [
      "Submission details are used to review your material and to reply to you. Meeting details are used to confirm and hold the conversation you requested.",
      "We do not sell, rent, or trade your personal information. Ever.",
    ],
  },
  {
    h: "Images & submitted material",
    ps: [
      "Material you submit stays private while it is under review. If a story is selected for publication, our editors will agree the details with you, including how you are credited, before anything is published.",
    ],
  },
  {
    h: "Third-party services",
    ps: [
      "The site is hosted by a third-party hosting provider, which processes technical data needed to serve the site. When you follow links to Instagram, TikTok, Facebook, or Threads, those platforms' own privacy policies apply.",
    ],
  },
  {
    h: "Cookies & consent",
    ps: [
      "This site sets no advertising or tracking cookies. Our visit statistics are cookieless and anonymous, so they cannot identify you.",
      "The banner on your first visit asks one thing: whether the site may remember your reading position (below). Accept and it works; decline and nothing is stored beyond the choice itself, and our visit statistics are switched off for you too.",
    ],
  },
  {
    h: "Remembering where you left off",
    ps: [
      "If you accept on the consent banner, your browser remembers which article you were reading and how far you had scrolled, so you can pick a story up where you stopped. This is kept on your own device using your browser's local storage. It is never sent to us, used to identify you, or shared with anyone.",
      "You can clear it at any time by clearing your browser's site data, and it simply forgets positions you haven't returned to in a month.",
    ],
  },
  {
    h: "Retention",
    ps: [
      "We keep submission and meeting correspondence for as long as needed to work together on a story. You can ask us to delete your information at any time.",
    ],
  },
  {
    h: "Your choices",
    ps: [
      "You may ask us at any time what information we hold about you, ask us to correct it, or ask us to delete it, via the Inquire page or through our Instagram, @thehumanthread_ae.",
    ],
  },
  {
    h: "Changes",
    ps: [
      "If our practices change, this page will change with them, and the date above will tell you when it last did.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Your data, plainly"
      title="Privacy Policy"
      updated="July 2026"
      intro="The short version: we only hold what you hand us, we use it for the reason you handed it over, and we never sell it."
      sections={sections}
    />
  );
}
