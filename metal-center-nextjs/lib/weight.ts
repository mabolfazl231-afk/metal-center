// فرمول‌های وزن تئوری فولاد — چگالی ۷۸۵۰ کیلوگرم بر متر مکعب
// واحدها: قطر، ضخامت، عرض، ارتفاع و ابعاد مقطع بر حسب میلی‌متر؛ طول بر حسب متر؛ خروجی بر حسب کیلوگرم

export const STEEL_DENSITY_KG_M3 = 7850;

// میلگرد ساده و آجدار: قطر (mm) و طول (m)
export const rebarKg = (d: number, L: number) => 0.006165375 * d * d * L;

// ورق سیاه، روغنی، گالوانیزه و آجدار (وزن پایه، بدون پوشش روی و آج): ضخامت و عرض (mm)، طول (m)
export const sheetKg = (t: number, w: number, L: number) => 0.00785 * t * w * L;

// قوطی مربع و مستطیل توخالی (گوشه‌ی تیز): عرض، ارتفاع و ضخامت (mm)، طول (m)
export const hollowKg = (w: number, h: number, t: number, L: number) => {
  const inner = Math.max(w - 2 * t, 0) * Math.max(h - 2 * t, 0);
  return 0.00785 * (w * h - inner) * L;
};

// نبشی مساوی و نامساوی — تخمین هندسی؛ وزن استاندارد کارخانه در اولویت است
export const angleEqualKg = (h: number, T: number, L: number) => 0.00785 * T * (2 * h - T) * L;
export const angleUnequalKg = (h: number, b: number, T: number, L: number) => 0.00785 * T * (h + b - T) * L;

// وزن استاندارد هر متر (کیلوگرم) — فقط سایزهایی که مقدارشان مطمئن است
export const IPE_KG_PER_M: Record<string, number> = {
  "IPE 120": 10.4,
  "IPE 140": 12.9,
  "IPE 160": 15.8,
  "IPE 180": 18.8,
  "IPE 200": 22.4,
  "IPE 220": 26.2,
  "IPE 240": 30.7,
  "IPE 270": 36.1,
  "IPE 300": 42.2,
};

export const UPN_KG_PER_M: Record<string, number> = {
  "UPN 80": 8.6,
  "UPN 100": 10.6,
  "UPN 120": 13.4,
  "UPN 160": 18.8,
  "UPN 200": 25.3,
};

// تبدیل عدد فارسی و کاما به عدد؛ اگر معتبر نبود NaN برمی‌گرداند
export function parseNumber(v: string): number {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const latin = v.replace(/[,٬\s]/g, "").replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
  return latin === "" ? NaN : Number(latin);
}
