"use client";

import CrudManager, { type CrudConfig } from "@/components/admin/CrudManager";

const CONFIG: CrudConfig = {
  table: "articles",
  title: "مقالات مرکز دانش",
  description: "مقالات صفحه‌ی «مرکز دانش». مقالات منتشرنشده در سایت دیده نمی‌شوند.",
  fields: [
    { key: "title", label: "عنوان مقاله", type: "text", required: true },
    { key: "tag", label: "برچسب (مثلاً راهنمای خرید)", type: "text" },
    { key: "read_minutes", label: "زمان مطالعه (دقیقه)", type: "number" },
    { key: "cover_url", label: "تصویر شاخص", type: "image" },
    { key: "excerpt", label: "خلاصه (زیر عنوان کارت)", type: "textarea" },
    { key: "body", label: "متن کامل (اختیاری)", type: "textarea", hint: "اگر پر باشد، زیر کارت دکمه‌ی «ادامه مطلب» نمایش داده می‌شود." },
    { key: "sort_order", label: "ترتیب نمایش (عدد کمتر، بالاتر)", type: "number" },
    { key: "published", label: "منتشر شده", type: "bool" },
  ],
  defaults: { title: "", tag: "راهنمای خرید", read_minutes: 5, cover_url: "", excerpt: "", body: "", published: true },
  titleKey: "title",
  subtitleKey: "tag",
  toggleKey: "published",
  addLabel: "مقاله جدید",
  emptyText: "مقاله‌ای ثبت نشده است.",
};

export default function ArticlesManager() {
  return <CrudManager config={CONFIG} />;
}
