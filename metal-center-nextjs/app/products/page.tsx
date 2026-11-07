import CategoryGrid from "@/components/CategoryGrid";
import PageBanner from "@/components/PageBanner";
import { fetchPage } from "@/lib/cms";

export const metadata = { title: "محصولات آهن‌آلات", description: "میلگرد، تیرآهن، ورق، پروفیل، نبشی و ناودانی با لیست قیمت و مشخصات کامل." };
export const revalidate = 60;

export default async function ProductsPage() {
  const page = await fetchPage("products");
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-12">
      <PageBanner
        page={page}
        fallbackTitle="محصولات آهن‌آلات"
        fallbackSubtitle="یک دسته را انتخاب کن تا لیست قیمت و سایزها را ببینی."
      />
      <CategoryGrid variant="products" />
    </div>
  );
}
