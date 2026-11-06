"use client";

import CrudManager, { type CrudConfig } from "@/components/admin/CrudManager";

const CONFIG: CrudConfig = {
  table: "menu_items",
  title: "منوی فوتر",
  description: "لینک‌های ستون «دسترسی سریع» در فوتر سایت. اگر اینجا آیتمی نباشد، منوی پیش‌فرض نمایش داده می‌شود.",
  fields: [
    { key: "label", label: "متن لینک", type: "text", required: true },
    { key: "href", label: "آدرس (مثلاً /prices یا https://...)", type: "text", required: true },
    { key: "sort_order", label: "ترتیب نمایش (عدد کمتر، بالاتر)", type: "number" },
    { key: "active", label: "نمایش در سایت", type: "bool" },
  ],
  defaults: { label: "", href: "/", active: true },
  filter: { column: "location", value: "footer" },
  titleKey: "label",
  subtitleKey: "href",
  toggleKey: "active",
  addLabel: "لینک جدید",
  emptyText: "لینکی ثبت نشده است.",
};

export default function MenuManager() {
  return <CrudManager config={CONFIG} />;
}
