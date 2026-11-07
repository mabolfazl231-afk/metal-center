import { Wrench, Scissors, Truck, Factory, ShieldCheck, Globe, Ruler, PackageCheck, type LucideIcon } from "lucide-react";
import { supabase } from "./supabase";
import { PHONES, EMAIL, SOCIAL, WORKING_HOURS } from "./site";

// دسترسی به محتوای مدیریت‌شده (CMS). اگر جدول خالی باشد یا خطا بدهد،
// صفحه از داده‌ی پیش‌فرض کد استفاده می‌کند تا سایت هیچ‌وقت خالی یا شکسته نشود.

export type Phone = { display: string; tel: string };
export type Hour = { days: string; hours: string };

export type Settings = {
  phones: Phone[];
  email: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  hours: Hour[];
  site_description: string;
  catalog_pdf_url: string;
};

export const DEFAULT_SETTINGS: Settings = {
  phones: PHONES,
  email: EMAIL,
  telegram: SOCIAL.telegram,
  instagram: SOCIAL.instagram,
  linkedin: SOCIAL.linkedin,
  hours: WORKING_HOURS,
  site_description: "",
  catalog_pdf_url: "",
};

export type MenuItem = { id: string; label: string; href: string; sort_order: number; active: boolean };
export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url?: string | null;
  sort_order: number;
  active: boolean;
};
export type SitePage = {
  key: string;
  title: string;
  subtitle: string;
  body: string;
  banner_url: string | null;
  published: boolean;
};
export type Article = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  tag: string;
  read_minutes: number;
  cover_url: string | null;
  sort_order: number;
  published: boolean;
};

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Wrench,
  Scissors,
  Truck,
  Factory,
  ShieldCheck,
  Globe,
  Ruler,
  PackageCheck,
};

export async function fetchSettings(): Promise<Settings> {
  try {
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", "general").maybeSingle();
    if (error || !data?.value) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(data.value as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function fetchMenu(location: string): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("location", location)
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data ?? []) as MenuItem[];
  } catch {
    return [];
  }
}

// null یعنی «هنوز چیزی در دیتابیس نیست؛ داده‌ی پیش‌فرض را نشان بده»
export async function fetchServices(): Promise<Service[] | null> {
  try {
    const { data, error } = await supabase.from("services").select("*").eq("active", true).order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data as Service[];
  } catch {
    return null;
  }
}

export async function fetchArticles(): Promise<Article[] | null> {
  try {
    const { data, error } = await supabase.from("articles").select("*").eq("published", true).order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data as Article[];
  } catch {
    return null;
  }
}

// بنر و متن یک صفحه؛ null یعنی هنوز در پنل ثبت نشده و عنوان پیش‌فرض صفحه نمایش داده می‌شود
export async function fetchPage(key: string): Promise<SitePage | null> {
  try {
    const { data, error } = await supabase
      .from("site_pages")
      .select("key,title,subtitle,body,banner_url,published")
      .eq("key", key)
      .eq("published", true)
      .maybeSingle();
    if (error || !data) return null;
    return data as SitePage;
  } catch {
    return null;
  }
}

// عدد فارسی برای نمایش زمان مطالعه
export const toFa = (n: number) => n.toLocaleString("fa-IR");
