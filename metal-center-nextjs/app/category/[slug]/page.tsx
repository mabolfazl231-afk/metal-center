import CategoryDetail from "@/components/CategoryDetail";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-12">
      <CategoryDetail slug={params.slug} />
    </div>
  );
}
