import CategoryGrid from "@/components/CategoryGrid";

export const metadata = { title: "محصولات فولادی", description: "میلگرد، تیرآهن، ورق، پروفیل، نبشی و ناودانی با لیست قیمت و مشخصات کامل." };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-12">
      <h1 className="mb-2 text-[30px] font-extrabold">محصولات فولادی</h1>
      <p className="mb-10 text-[15px] text-ink/60">یک دسته را انتخاب کن تا لیست قیمت و سایزها را ببینی.</p>
      <CategoryGrid variant="products" />
    </div>
  );
}
