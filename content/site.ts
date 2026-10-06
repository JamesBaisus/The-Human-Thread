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

  /** What the journal covers. Set between the rules under the landing
   *  masthead, and carried across the moving band further down. */
  taxonomy: ["News", "People", "Culture", "Art", "Fashion", "Community"],

  /** How many Edit pieces are dealt into the fanned deck; the rest wait in the
   *  THT Edit section, which always holds the full set. */
  editDeckSize: 5,

  /**
   * The letter near the footer, read by scrolling it sideways. Each entry is
   * one panel; `lines` are set as separate lines rather than a paragraph, and
   * `emphasis` sets the panel as the statement it builds to.
   */
  letter: {
    eyebrow: "A Letter to Our Readers",
    title: "Why We Exist",
    panels: [
      {
        lines: [
          "The Human Thread_AE began with a simple belief.",
          "Behind every face, every creation, every success and every name,",
          "there is a human story worth knowing.",
        ],
      },
      {
        lines: [
          "We live in a world that moves quickly.",
          "We see the finished image, the achievement, the beautiful moment.",
          "But rarely do we stop to ask what came before it.",
        ],
      },
      {
        lines: ["The courage.", "The doubt.", "The work.", "The loss.", "The becoming."],
        tail: "That is where we want to look.",
      },
      {
        lines: [
          "We exist to tell stories with depth, curiosity and humanity.",
          "To celebrate creativity, culture, fashion and art, while never forgetting",
          "the person behind them.",
        ],
      },
      {
        lines: [
          "Some of the people we feature are known around the world.",
          "Others are still building their names. To us, both stories can matter equally.",
          "Because visibility should not only belong to those who already have it.",
        ],
      },
      {
        lines: [
          "The Human Thread_AE is still growing, still learning and still becoming.",
          "But our purpose remains clear.",
        ],
      },
      {
        emphasis: true,
        lines: ["To look beyond what is seen and tell the human story underneath."],
      },
      {
        lines: [
          "Thank you for reading.",
          "Thank you for believing in stories.",
          "And thank you for becoming part of ours.",
        ],
        signoff: "Everything about human interests us.",
      },
    ],
  },

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
    // the order asked for; Gallery sits among the categories now, so the old
    // "Articles" / "The Cover Gallery" group headers no longer describe it
    { header: null, items: ["Human Stories", "Lifestyle", "Fashion", "Gallery", "Art", "THT Edit"] },
    { header: null, items: ["Home", "About"] },
  ],

  /** Editorial band header. The editorials themselves live in
   *  content/editorials/editorials.json (added via the admin panel). */
  carousel: {
    eyebrow: "The Editorials",
    title: "Inside the Issue",
    sub: "Photo stories from the issue. Open one to turn through the full spread.",
  },

  /** The line above the About copy, and the copy itself. */
  aboutHeadline: "A global perspective. A human connection.",

  aboutBody: [
    "The Human Thread_AE is an independent digital journal based in the UAE, bringing a human perspective to culture, art, fashion, and contemporary life.",
    "Through thoughtful interviews, editorial features, and compelling photography, we explore the people and ideas shaping our world. Our stories reveal the vision behind a brand, the experience behind an artist's work, and the personal journey behind a public achievement.",
    "We bring emerging voices and established figures into the same conversation, guided by curiosity, care, and respect for the experiences they share. Across our coverage, we explore how creativity, heritage, and identity influence the way we live and connect.",
    "Rooted in the UAE, with an international outlook, The Human Thread_AE invites readers to discover new perspectives and look more closely at familiar ones.",
    "At the heart of every story is the thread that connects us: our humanity.",
  ],

  values: [
    { title: "Human first", text: "Every story starts with a person, never a product." },
    { title: "Slow media", text: "Fewer, longer, better. We would rather be right than first." },
    { title: "Regional pride", text: "Local voices, told with the depth the world reserves for others." },
    { title: "Beauty with meaning", text: "Aesthetics are welcome, emptiness is not." },
  ],
} as const;

export type Site = typeof site;
