// Placeholder in-memory data.
// In Stage 11 (Supabase integration), replace each export below with a
// function that queries the corresponding Postgres table
// (e.g. `products`, `daily_prices`, `factories`) instead of returning
// this static array. Keeping the same shape means the UI components
// won't need to change — only these data-fetching functions will.

export const dailyPrices = [
  { name: "میلگرد A3 سایز ۱۴", factory: "ذوب آهن اصفهان", price: "۲۹,۸۵۰", change: "+1.2%", dir: "up" as const },
  { name: "تیرآهن IPE ۱۴", factory: "فولاد ناب تبریز", price: "۴۱,۲۰۰", change: "+0.6%", dir: "up" as const },
  { name: "ورق روغنی ۲ میل", factory: "فولاد مبارکه", price: "۵۲,۹۰۰", change: "-0.8%", dir: "down" as const },
  { name: "قوطی ۴۰×۴۰", factory: "گروه ملی صنعتی", price: "۳۳,۱۰۰", change: "+2.1%", dir: "up" as const },
];

export const categories = [
  { name: "میلگرد", count: "۴۲ سایز" },
  { name: "تیرآهن", count: "۲۸ سایز" },
  { name: "ورق", count: "۳۵ نوع" },
  { name: "پروفیل", count: "۳۱ سایز" },
  { name: "نبشی و ناودانی", count: "۲۲ سایز" },
];

export const factories = [
  { name: "ذوب آهن اصفهان", location: "اصفهان، ایران", products: 14 },
  { name: "فولاد مبارکه", location: "مبارکه، اصفهان", products: 22 },
  { name: "فولاد کاوه اهواز", location: "اهواز، خوزستان", products: 9 },
  { name: "فولاد ناب تبریز", location: "تبریز، آذربایجان شرقی", products: 11 },
];

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
  stock: "موجود" | "محدود" | "ناموجود";
  aiPrediction: "افزایش" | "کاهش" | "ثابت";
  spark: number[];
}

export interface FactoryGroup {
  factory: string;
  shortName: string;
  updatedAgo: string;
  totalStock: string;
  totalChange: number;
  rows: PriceRow[];
}

export const factoryPriceGroups: FactoryGroup[] = [
  {
    factory: "ذوب آهن اصفهان",
    shortName: "ذآ",
    updatedAgo: "۲ دقیقه پیش",
    totalStock: "۲۴۵ تن",
    totalChange: 1.2,
    rows: [
      { name: "میلگرد A3", size: "۱۴", weight: "۱۸.۵", price: 65900, change: 0.76, stock: "موجود", aiPrediction: "افزایش", spark: [10, 12, 11, 14, 13, 15, 17] },
      { name: "میلگرد A3", size: "۱۶", weight: "۲۰.۰", price: 65000, change: 0, stock: "موجود", aiPrediction: "ثابت", spark: [14, 13, 14, 13, 15, 14, 15] },
      { name: "میلگرد A3", size: "۲۰", weight: "۲۲.۰", price: 64500, change: -0.46, stock: "موجود", aiPrediction: "کاهش", spark: [17, 16, 15, 15, 14, 13, 12] },
    ],
  },
  {
    factory: "فولاد مبارکه اصفهان",
    shortName: "فم",
    updatedAgo: "۳ دقیقه پیش",
    totalStock: "۳۱۲ تن",
    totalChange: 2.1,
    rows: [
      { name: "ورق روغنی", size: "۲mm", weight: "—", price: 52900, change: 1.3, stock: "موجود", aiPrediction: "افزایش", spark: [11, 13, 12, 15, 14, 16, 17] },
      { name: "ورق سیاه", size: "۳mm", weight: "—", price: 48300, change: 0.4, stock: "محدود", aiPrediction: "ثابت", spark: [12, 13, 12, 14, 13, 14, 15] },
    ],
  },
  {
    factory: "فولاد خراسان",
    shortName: "فخ",
    updatedAgo: "۵ دقیقه پیش",
    totalStock: "۱۸۷ تن",
    totalChange: -1.8,
    rows: [
      { name: "تیرآهن IPE", size: "۱۴", weight: "۱۲.۷", price: 41200, change: -0.6, stock: "موجود", aiPrediction: "کاهش", spark: [16, 15, 16, 14, 15, 13, 14] },
      { name: "تیرآهن IPE", size: "۱۸", weight: "۱۸.۸", price: 40900, change: -0.2, stock: "موجود", aiPrediction: "کاهش", spark: [15, 14, 15, 13, 14, 12, 13] },
    ],
  },
  {
    factory: "فولاد کویر کاشان",
    shortName: "فک",
    updatedAgo: "۷ دقیقه پیش",
    totalStock: "۹۸ تن",
    totalChange: 2.4,
    rows: [
      { name: "قوطی پروفیل", size: "۴۰×۴۰", weight: "۲.۹", price: 33100, change: 2.1, stock: "موجود", aiPrediction: "افزایش", spark: [9, 11, 10, 13, 15, 16, 18] },
      { name: "نبشی", size: "۵×۵۰", weight: "۳.۸", price: 28400, change: -0.3, stock: "موجود", aiPrediction: "ثابت", spark: [15, 14, 15, 13, 14, 12, 13] },
    ],
  },
];
