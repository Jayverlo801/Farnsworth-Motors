import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllVehicles } from "@/lib/vehicles/source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/inventory",
    "/process",
    "/about",
    "/sell",
    "/trade",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/title-disclosure",
  ].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const vehicles = (await getAllVehicles()).flatMap((v) => [
    {
      url: `${site.url}/vehicle/${v.slug}`,
      lastModified: v.dateListed,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${site.url}/vehicle/${v.slug}/record`,
      lastModified: v.dateListed,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

  return [...staticRoutes, ...vehicles];
}
