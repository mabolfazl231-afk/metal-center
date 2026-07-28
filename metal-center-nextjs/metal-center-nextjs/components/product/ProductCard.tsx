"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Heart } from "lucide-react";
import { useState } from "react";

export interface ProductCardData {
  name: string;
  factory: string;
  price: string;
  unit?: string;
  badge?: "موجود" | "محدود" | "ناموجود";
  href?: string;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const [favorited, setFavorited] = useState(false);
  const badgeTone =
    product.badge === "موجود" ? "bg-success" : product.badge === "محدود" ? "bg-warning" : "bg-danger";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group overflow-hidden rounded-card border border-border-light bg-white shadow-soft transition-shadow duration-300 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
    >
      <Link href={product.href ?? "/products/sample"} className="block">
        <div className="relative flex h-[150px] items-center justify-center bg-gradient-to-br from-[#EAF0FA] to-[#DCE7FA] dark:from-[#16233d] dark:to-[#101a2c]">
          <Package size={40} strokeWidth={1.3} className="text-blue/50" />
          {product.badge && (
            <span className={`absolute start-2.5 top-2.5 rounded-pill px-2.5 py-1 text-[10.5px] font-bold text-white ${badgeTone}`}>
              {product.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              setFavorited((f) => !f);
            }}
            className="absolute end-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur"
            aria-label="افزودن به علاقه‌مندی"
          >
            <Heart size={13} className={favorited ? "fill-danger text-danger" : "text-ink/40"} />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-1 text-sm font-bold leading-6">{product.name}</div>
          <div className="mb-3 text-xs text-ink/50 dark:text-white/40">{product.factory}</div>
          <div className="flex items-center justify-between border-t border-border-light pt-3 dark:border-border-dark">
            <div className="text-sm font-extrabold">
              {product.price}
              <span className="ms-1 text-[11px] font-medium text-ink/40">/ {product.unit ?? "kg"}</span>
            </div>
            <span className="text-xs font-bold text-blue opacity-0 transition-opacity group-hover:opacity-100">
              مشاهده ←
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
