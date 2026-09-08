export const site = {
  /* Canonical origin for metadata, sitemap, OG. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://farnsworthmotors.com",
  name: "Farnsworth Motors",
  tagline: "Built again.",
  legalName: "Oceans Auto LLC",
  dba: "DBA Farnsworth Motors",
  location: "Salt Lake City, Utah",
  // TODO: replace with the real inbox before launch.
  email: "hello@farnsworthmotors.com",
  languages: "Se habla español.",
  description:
    "Farnsworth Motors finds vehicles worth saving, restores them intelligently, and brings them back to the road with the history documented along the way.",
} as const;
