import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/admin"], // پنل‌های خصوصی نباید در گوگل نمایه بشن
      },
    ],
    sitemap: "https://metal-center-aqfg.vercel.app/sitemap.xml",
  };
}
