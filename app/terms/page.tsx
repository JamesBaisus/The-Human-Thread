import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service — The Human Thread",
  description: "Terms of Service for The Human Thread_AE.",
};

const sections = [
  {
    h: "Acceptance of these terms",
    ps: [
      "The Human Thread_AE is an independent digital editorial magazine. By reading the site, subscribing to the newsletter, or submitting material to the editors, you agree to these terms. If you do not agree with them, please do not use the site.",
    ],
  },
  {
    h: "Editorial content & intellectual property",
    ps: [
      "All articles, photography, covers, layouts, and other editorial material published on this site are the property of The Human Thread_AE or of the contributors and subjects who have granted us the right to publish them.",
      "You are welcome to share links to our stories. Reproducing, republishing, or redistributing content — in whole or in part, commercially or otherwise — requires our prior written permission, with the exception of brief quotations with clear credit and a link to the original story.",
    ],
  },
  {
    h: "Submissions",
    ps: [
      "When you send us material through the Inquire page or by other means — text, images, or ideas — you confirm that you own the rights to it, or have permission from those who do, and that publishing it would not infringe anyone's rights.",
      "Submitting material does not guarantee publication. By submitting, you grant our editors the right to review the material and, if selected, to edit and publish it in the magazine with appropriate credit. The material itself remains yours.",
    ],
  },
  {
    h: "Meetings & correspondence",
    ps: [
      "Booking an editorial meeting through the site is a request, not a confirmed appointment, until our editors confirm it by email. We reserve the right to decline or reschedule requests.",
    ],
  },
  {
    h: "Acceptable use",
    ps: [
      "You agree not to misuse the site — including attempting to disrupt it, scraping content at scale, misrepresenting your identity in submissions, or submitting material that is unlawful, defamatory, or infringes the rights of others.",
    ],
  },
  {
    h: "Third-party links & platforms",
    ps: [
      "The site links to third-party platforms such as Instagram, TikTok, Facebook, and Threads. We are not responsible for the content, terms, or privacy practices of those platforms.",
    ],
  },
  {
    h: "No warranties",
    ps: [
      "The site and its content are provided as they are, for editorial and informational purposes. While we work carefully, we make no warranties about completeness or accuracy, and we are not liable for decisions made on the basis of published content.",
    ],
  },
  {
    h: "Changes & contact",
    ps: [
      "We may update these terms from time to time; the date above reflects the latest revision. Continued use of the site after a change means you accept the updated terms.",
      "Questions about these terms can be sent to the editors via the Inquire page or through our Instagram, @thehumanthread_ae.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="The fine print"
      title="Terms of Service"
      updated="July 2026"
      intro="The short version: read freely, share generously with credit, and only send us work that is yours to share."
      sections={sections}
    />
  );
}
