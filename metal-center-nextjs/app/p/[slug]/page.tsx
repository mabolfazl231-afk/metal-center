import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import { fetchPage } from "@/lib/cms";

export const revalidate = 60;

// صفحه‌های جدیدی که از پنل «صفحات سایت» ساخته می‌شوند، مثلاً /p/shipping
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await fetchPage(params.slug);
  return { title: page?.title ?? "صفحه", description: page?.subtitle ?? "" };
}

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const page = await fetchPage(params.slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <PageBanner page={page} fallbackTitle={page.title} />
    </div>
  );
}
