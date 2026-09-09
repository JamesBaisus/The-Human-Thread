// Global site copy & configuration.
// Copy here is verbatim from the design prototype — edit carefully.

export const site = {
  /** Default themeable accent. Options: #9a6b3f (bronze), #8f4b58 (plum), #5c6b57 (olive), #1c1a17 (near-black). */
  accent: "#9a6b3f",

  instagram: "https://www.instagram.com/thehumanthread_ae",

  /** Social profiles shown in the nav drawer. */
  socials: [
    { label: "TikTok", href: "https://www.tiktok.com/@tht_ae" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61591122367063" },
    { label: "Threads", href: "https://www.threads.com/@thehumanthread_ae" },
    { label: "Instagram", href: "https://www.instagram.com/thehumanthread_ae" },
  ],

  /** Exactly one article drives the hero. */
  featuredSlug: "alberto-gianfreda",

  /** The dark "Read the feature" band near the footer. */
  coverBand: { slug: "bts", kicker: "The Cover Story" },

  /** Fixed category display order; only categories with articles render. */
  categories: [
    "Fashion",
    "Culture",
    "Art",
    "Human Stories",
    "Lifestyle",
    "Features",
  ],

  /**
   * Nav drawer groups, in display order. A group may carry a small label
   * header. "Home", "THT Edit", "Gallery" and "About" are fixed anchors; any other item
   * must be a category name — it links to its section on the landing page,
   * or to the filtered catalogue if it has no articles yet.
   */
  nav: [
    { header: null, items: ["Home", "THT Edit"] },
    { header: "Articles", items: ["Human Stories", "Fashion", "Art", "Lifestyle"] },
    { header: "The Cover Gallery", items: ["Gallery"] },
    { header: null, items: ["About"] },
  ],

  /** Editorial band header. The editorials themselves live in
   *  content/editorials/editorials.json (added via the admin panel). */
  carousel: {
    eyebrow: "The Editorials",
    title: "Inside the Issue",
    sub: "Photo stories from the issue. Open one to turn through the full spread.",
  },

  /** "Featured in this issue" marquee names. */
  marqueeNames: [
    "Nathalya Rai",
    "Ruben",
    "BTS",
    "Vikki Feltham",
    "Noj Barker",
    "Hiba Osman",
    "Caroline Labouchere",
  ],

  aboutBody: [
    "The Human Thread_AE is an independent digital magazine shaped by stories, culture, identity, and the quiet power of human experience.",
    "Created in the UAE with a global editorial vision, the magazine explores the people, places, brands, artists, and ideas that carry meaning beyond the surface. Through thoughtful features and refined visual storytelling, we look at fashion, art, culture, and community as reflections of something deeper: who we are, what we value, and how we are remembered.",
    "At The Human Thread_AE, every story begins with a person. We are drawn to journeys of resilience, creativity, ambition, heritage, reinvention, and purpose: the moments that shape a life, a vision, or a legacy.",
    "Our editorial voice is intimate yet elevated, emotional yet timeless. We do not chase noise. We follow substance.",
    "From Dubai to the world, The Human Thread_AE exists to document the threads that connect us: the stories behind the faces, the meaning behind the work, and the humanity behind every expression.",
  ],

  values: [
    { title: "Human first", text: "Every story starts with a person, never a product." },
    { title: "Slow media", text: "Fewer, longer, better. We would rather be right than first." },
    { title: "Regional pride", text: "Local voices, told with the depth the world reserves for others." },
    { title: "Beauty with meaning", text: "Aesthetics are welcome, emptiness is not." },
  ],
} as const;

export type Site = typeof site;
