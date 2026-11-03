import { buildCatalogGroups } from "./catalog";
// Placeholder in-memory data.
// In Stage 11 (Supabase integration), replace each export below with a
// function that queries the corresponding Postgres table
// (e.g. `products`, `daily_prices`, `factories`) instead of returning
// this static array. Keeping the same shape means the UI components
// won't need to change — only these data-fetching functions will.

export const dailyPrices = [
  { name: "میلگرد A3 سایز ۱۴", cat: "rebar", factory: "ذوب آهن اصفهان", price: "۲۹,۸۵۰", change: "+1.2%", dir: "up" as const },
  { name: "تیرآهن IPE ۱۴", cat: "beam", factory: "فولاد ناب تبریز", price: "۴۱,۲۰۰", change: "+0.6%", dir: "up" as const },
  { name: "ورق روغنی ۲ میل", cat: "sheet", factory: "فولاد مبارکه", price: "۵۲,۹۰۰", change: "-0.8%", dir: "down" as const },
  { name: "قوطی ۴۰×۴۰", cat: "profile", factory: "گروه ملی صنعتی", price: "۳۳,۱۰۰", change: "+2.1%", dir: "up" as const },
];

export const categories = [
  { name: "میلگرد", slug: "rebar", count: "۱۳ سایز", color: "#0A3D91", sizes: ["8", "10", "12", "14", "16", "18", "20", "22", "25", "28", "32", "36", "40"] },
  { name: "تیرآهن", slug: "beam", count: "۱۱ سایز", color: "#E8590C", sizes: ["12", "14", "16", "18", "20", "22", "24", "26", "27", "28", "30"] },
  { name: "ورق", slug: "sheet", count: "۴۳ ضخامت", color: "#0CA678", sizes: ["2mm", "3mm", "4mm", "5mm", "6mm", "8mm", "10mm", "12mm", "15mm", "20mm"] },
  { name: "پروفیل", slug: "profile", count: "۲۱ سایز", color: "#7048E8", sizes: ["20×20", "25×25", "30×30", "40×40", "50×50", "60×60", "80×80", "100×100", "30×20", "40×20", "60×40", "100×50"] },
  { name: "نبشی و ناودانی", slug: "channel", count: "۲۳ سایز", color: "#F08C00", sizes: ["ناودانی ۸", "ناودانی ۱۰", "ناودانی ۱۲", "ناودانی ۱۶", "ناودانی ۲۰", "نبشی ۳۰", "نبشی ۴۰", "نبشی ۵۰", "نبشی ۶۰", "نبشی ۸۰", "نبشی ۱۰۰"] },
];

export const factories = [
  { name: "ذوب‌آهن اصفهان", slug: "zob-ahan", cats: "میلگرد · تیرآهن · نبشی و ناودانی", products: 4 },
  { name: "آریان فولاد", slug: "arian", cats: "میلگرد · تیرآهن · نبشی و ناودانی", products: 4 },
  { name: "هیربد زرندیه", slug: "hirbod-zarandieh", cats: "میلگرد", products: 1 },
  { name: "فولاد بافق یزد", slug: "bafgh", cats: "میلگرد", products: 1 },
  { name: "فولاد کویر کاشان", slug: "kavir", cats: "میلگرد", products: 1 },
  { name: "فایکو", slug: "faico", cats: "تیرآهن", products: 1 },
  { name: "ناب تبریز", slug: "nab-tabriz", cats: "تیرآهن · نبشی و ناودانی", products: 3 },
  { name: "فولاد یزد", slug: "yazd", cats: "تیرآهن", products: 1 },
  { name: "فولاد مبارکه اصفهان", slug: "mobarakeh", cats: "ورق", products: 1 },
  { name: "فولاد اکسین خوزستان", slug: "exin", cats: "ورق", products: 1 },
  { name: "فولاد کاویان", slug: "kavian", cats: "ورق", products: 1 },
  { name: "فولاد گیلان", slug: "gilan", cats: "ورق", products: 1 },
  { name: "نورد و لوله اهواز", slug: "ahvaz-pipe", cats: "ورق", products: 1 },
  { name: "نورد و پروفیل ساوه", slug: "saveh", cats: "پروفیل", products: 1 },
  { name: "نیکان پروفیل", slug: "nikan", cats: "پروفیل", products: 1 },
  { name: "سپنتا", slug: "sepanta", cats: "پروفیل", products: 1 },
  { name: "گروه صنعتی شرق", slug: "sharq", cats: "پروفیل", products: 1 },
  { name: "هیربد", slug: "hirbod", cats: "پروفیل", products: 1 },
  { name: "شکفته مشهد", slug: "shekofteh", cats: "نبشی و ناودانی", products: 2 },
  { name: "فولاد کوهپایه", slug: "kouhpayeh", cats: "نبشی و ناودانی", products: 2 },
  { name: "جاوید بناب", slug: "javid-benab", cats: "نبشی و ناودانی", products: 2 },
];

// اسلاگ کارخانه‌هایی که لوگوی آن‌ها داخل public/factories/<slug>.png آپلود شده را اینجا اضافه کنید
export const factoryLogos: string[] = [];


export const articles = [
  { title: "چگونه سایز میلگرد مناسب سازه را انتخاب کنیم؟", tag: "راهنمای خرید", time: "۶ دقیقه" },
  { title: "روند قیمت فولاد در سه‌ماهه پیش‌رو", tag: "تحلیل بازار", time: "۹ دقیقه" },
  { title: "مقایسه استاندارد A2 و A3 در میلگرد ساختمانی", tag: "استانداردها", time: "۵ دقیقه" },
];

export const services = [
  { title: "برش فولاد", desc: "برش دقیق ورق و مقاطع فولادی مطابق نقشه فنی شما." },
  { title: "خم‌کاری", desc: "خم‌کاری ورق و پروفیل با زوایای دقیق." },
  { title: "گالوانیزه", desc: "پوشش‌دهی ضد زنگ برای افزایش عمر مفید سازه." },
  { title: "لجستیک و حمل", desc: "هماهنگی باربری سراسری برای تحویل مطمئن." },
  { title: "صادرات", desc: "مدیریت کامل فرآیند صادرات از مستندسازی تا حمل." },
  { title: "تأمین پروژه‌ای", desc: "تأمین حجم بالا برای پروژه‌های عمرانی و صنعتی." },
];

export const incoterms = [
  { code: "EXW", desc: "تحویل درب کارخانه، مسئولیت حمل بر عهده خریدار" },
  { code: "FOB", desc: "تحویل روی عرشه کشتی در بندر مبدأ" },
  { code: "CFR", desc: "هزینه و کرایه حمل تا بندر مقصد بر عهده فروشنده" },
  { code: "CIF", desc: "هزینه، بیمه و کرایه حمل تا بندر مقصد" },
];

export const rfqRows = [
  { id: "#RFQ-10482", name: "میلگرد A3 سایز ۱۴ - ۵ تن", date: "۱۴۰۴/۰۴/۳۰", status: "review" as const },
  { id: "#RFQ-10465", name: "تیرآهن IPE ۱۸ - ۲ تن", date: "۱۴۰۴/۰۴/۲۶", status: "pending" as const },
  { id: "#RFQ-10430", name: "ورق روغنی ۲ میل - ۱۰۰۰ کیلوگرم", date: "۱۴۰۴/۰۴/۲۰", status: "done" as const },
];

export const statusLabel: Record<string, string> = {
  pending: "در انتظار بررسی",
  review: "در حال قیمت‌گذاری",
  done: "تکمیل‌شده",
};

// داده‌ی نمونه برای صفحه‌ی قیمت روز — گروه‌بندی‌شده بر اساس کارخانه.
// بعداً هر factory از جدول factories و هر row از join جدول products + daily_prices خونده می‌شود.
export interface PriceRow {
  name: string;
  size: string;
  weight: string;
  price: number;
  change: number;
  stock: "موجود" | "محدود" | "ناموجود" | "نامشخص";
  aiPrediction: "افزایش" | "کاهش" | "ثابت";
  spark: number[];
  callForPrice?: boolean;
  history?: { price: number; at: string }[];
}

export interface FactoryGroup {
  factory: string;
  shortName: string;
  updatedAgo: string;
  totalStock: string;
  totalChange: number;
  delivery?: string;
  rows: PriceRow[];
}

export const factoryPriceGroups: FactoryGroup[] = buildCatalogGroups();
