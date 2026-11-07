"use client";

import { useState } from "react";
import ProductPriceManager from "@/components/admin/ProductPriceManager";
import PriceSheet from "@/components/admin/PriceSheet";
import FactoryCategoryManager from "@/components/admin/FactoryCategoryManager";

// بخش «محصولات و قیمت»: محصول، جدول قیمت اکسلی، و کارخانه‌ها با دسته‌بندی‌ها در یک جا
const SUB = [
  { key: "products", label: "محصولات" },
  { key: "sheet", label: "جدول قیمت (اکسلی)" },
  { key: "factories", label: "کارخانه‌ها و دسته‌بندی‌ها" },
] as const;

export default function ProductsHub() {
  const [sub, setSub] = useState<(typeof SUB)[number]["key"]>("products");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SUB.map((s) => (
          <button
            key={s.key}
            onClick={() => setSub(s.key)}
            className={`rounded-pill border px-4 py-2 text-xs font-bold transition ${
              sub === s.key ? "border-blue bg-blue text-white" : "border-black/10 text-ink/60 hover:border-blue/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sub === "products" && <ProductPriceManager />}
      {sub === "sheet" && <PriceSheet />}
      {sub === "factories" && <FactoryCategoryManager />}
    </div>
  );
}
