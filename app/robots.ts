import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/projects",
          "/settings",
          "/billing",
          "/api/",
        ],
      },
    ],
    sitemap: "https://deckmargin.com/sitemap.xml",
  };
}
