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
