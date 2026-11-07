"use client";

import CrudManager, { type CrudConfig } from "@/components/admin/CrudManager";
import { SERVICE_ICONS } from "@/lib/cms";

const CONFIG: CrudConfig = {
  table: "services",
  title: "خدمات",
  description: "خدماتی که در صفحه‌ی «خدمات» نمایش داده می‌شوند. تا وقتی اینجا خدمتی نباشد، خدمات پیش‌فرض سایت نشان داده می‌شود.",
  fields: [
    { key: "title", label: "نام خدمت", type: "text", required: true },
    { key: "description", label: "توضیح", type: "textarea" },
    { key: "icon", label: "آیکون", type: "select", options: Object.keys(SERVICE_ICONS) },
    { key: "image_url", label: "عکس خدمت (اختیاری)", type: "image" },
    { key: "sort_order", label: "ترتیب نمایش (عدد کمتر، بالاتر)", type: "number" },
    { key: "active", label: "نمایش در سایت", type: "bool" },
  ],
  defaults: { title: "", description: "", icon: "Wrench", image_url: "", active: true },
  titleKey: "title",
  subtitleKey: "description",
  toggleKey: "active",
  addLabel: "خدمت جدید",
  emptyText: "خدمتی ثبت نشده است.",
};

export default function ServicesManager() {
  return <CrudManager config={CONFIG} />;
}
