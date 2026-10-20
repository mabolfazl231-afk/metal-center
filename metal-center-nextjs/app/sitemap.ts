import type { MetadataRoute } from "next";

// این فایل به‌صورت خودکار در آدرس /sitemap.xml در دسترس گوگل قرار می‌گیرد.
// وقتی صفحه‌ی جدیدی اضافه کردید، آدرسش را به همین لیست اضافه کنید.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://metal-center-aqfg.vercel.app"; // بعداً با دامنه‌ی نهایی جایگزین شود

  const routes = [
    "",
    "/products",
    "/prices",
    "/rfq",
    "/factories",
    "/knowledge",
    "/services",
    "/export",
    "/about",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/prices" ? "hourly" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
