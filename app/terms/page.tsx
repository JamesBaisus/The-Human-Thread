import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms & Conditions — The Human Thread",
  description: "Terms & Conditions for The Human Thread_AE.",
};

const sections = [
  {
    h: "Our Content",
    ps: [
      "The Human Thread_AE is an editorial magazine sharing human stories, culture, fashion, art, and creative features.",
      "All articles, captions, layouts, graphics, logo, interviews, and written content belong to The Human Thread_AE unless stated otherwise. You may not copy, repost, sell, edit, or reuse our content without written permission.",
    ],
  },
  {
    h: "Interviews & Submissions",
    ps: [
      "By submitting your story, images, brand details, interview answers, or press materials, you confirm that you have the right to share them with us.",
      "You also give The Human Thread_AE permission to use the submitted material for our website, magazine, social media, and promotional editorial purposes.",
      "Publication is not guaranteed. We may edit content for clarity, grammar, length, tone, or layout while keeping the original meaning.",
    ],
  },
  {
    h: "Images & Copyright",
    ps: [
      "Any photos, videos, logos, or materials sent to us must be owned by you or shared with proper permission.",
      "The Human Thread_AE is not responsible for copyright issues caused by materials submitted by third parties who claimed they had permission to share them.",
    ],
  },
  {
    h: "Publishing Rights",
    ps: [
      "Only The Human Thread_AE and its approved administrators can publish, edit, approve, or remove content from our website, magazine, and social platforms.",
    ],
  },
  {
    h: "Collaborations & Advertising",
    ps: [
      "We may publish sponsored features, collaborations, advertisements, press content, or brand stories. We reserve the right to accept or refuse any collaboration that does not fit our editorial direction.",
    ],
  },
  {
    h: "Accuracy & Changes",
    ps: [
      "We aim to publish with care and accuracy, but we do not guarantee that all content will always be complete, current, or error-free.",
      "We may update, correct, edit, or remove content at any time.",
    ],
  },
  {
    h: "Liability",
    ps: [
      "The Human Thread_AE is not responsible for any loss, claim, copyright issue, misunderstanding, or damage caused by the use of our content, website, or submitted materials.",
    ],
  },
  {
    h: "Contact",
    ps: [
      "For permissions, corrections, collaborations, or concerns, contact:",
      "The Human Thread_AE · hello@thehumanthreadae.ae · thehumanthreadae.ae",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="The fine print"
      title="Terms & Conditions"
      updated="8 July 2026"
      intro="By using The Human Thread_AE website, magazine, social media pages, articles, interviews, or editorial content, you agree to these Terms & Conditions."
      sections={sections}
    />
  );
}
