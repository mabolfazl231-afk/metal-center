// وضعیت‌ها و ابزارهای مشترک استعلام، پیش‌فاکتور و سفارش؛ پنل خریدار و پنل ادمین از این فایل استفاده می‌کنند.

export type RfqStatus = "submitted" | "reviewing" | "quoted" | "closed" | "cancelled";
export type ProformaStatus = "draft" | "sent" | "accepted" | "rejected";
export type OrderStatus = "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";

export const RFQ_STATUSES: RfqStatus[] = ["submitted", "reviewing", "quoted", "closed", "cancelled"];
export const ORDER_STATUSES: OrderStatus[] = ["confirmed", "preparing", "shipped", "delivered", "cancelled"];

// استعلام‌هایی که هنوز در جریان‌اند
export const RFQ_ACTIVE: RfqStatus[] = ["submitted", "reviewing", "quoted"];

// مقدار مالیات بر ارزش افزوده (طبق قانون پروژه: ×۱٫۱۰)
export const VAT_PERCENT = 10;

export const RFQ_STATUS_LABEL: Record<RfqStatus, string> = {
  submitted: "ثبت‌شده",
  reviewing: "در حال بررسی",
  quoted: "قیمت‌گذاری شد",
  closed: "بسته شد",
  cancelled: "لغو شده",
};

export const RFQ_STATUS_STYLE: Record<RfqStatus, string> = {
  submitted: "bg-warning/15 text-[#B87700]",
  reviewing: "bg-blue/10 text-blue",
  quoted: "bg-success/10 text-success",
  closed: "bg-black/5 text-ink/60",
  cancelled: "bg-danger/10 text-danger",
};

export const PROFORMA_STATUS_LABEL: Record<ProformaStatus, string> = {
  draft: "پیش‌نویس",
  sent: "منتظر تأیید شما",
  accepted: "تأیید شد",
  rejected: "رد شد",
};

export const PROFORMA_STATUS_STYLE: Record<ProformaStatus, string> = {
  draft: "bg-black/5 text-ink/60",
  sent: "bg-warning/15 text-[#B87700]",
  accepted: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "ثبت و تأیید شد",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شد",
  delivered: "تحویل شد",
  cancelled: "لغو شد",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  confirmed: "bg-blue/10 text-blue",
  preparing: "bg-warning/15 text-[#B87700]",
  shipped: "bg-blue/10 text-blue",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

export function statusLabel(s: string): string {
  return RFQ_STATUS_LABEL[s as RfqStatus] ?? s;
}

export function statusStyle(s: string): string {
  return RFQ_STATUS_STYLE[s as RfqStatus] ?? "bg-black/5 text-ink/60";
}

export function proformaLabel(s: string): string {
  return PROFORMA_STATUS_LABEL[s as ProformaStatus] ?? s;
}

export function proformaStyle(s: string): string {
  return PROFORMA_STATUS_STYLE[s as ProformaStatus] ?? "bg-black/5 text-ink/60";
}

export function orderLabel(s: string): string {
  return ORDER_STATUS_LABEL[s as OrderStatus] ?? s;
}

export function orderStyle(s: string): string {
  return ORDER_STATUS_STYLE[s as OrderStatus] ?? "bg-black/5 text-ink/60";
}

// ارقام فارسی را لاتین می‌کند تا شماره‌ی موبایل و مبلغ درست خوانده شود
export function toEn(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

// عدد ورودی (با یا بی‌کاما و فارسی) را به عدد تبدیل می‌کند؛ نامعتبر = ۰
export function toNum(s: string): number {
  const n = Number(toEn(s).replace(/[,٬\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

export function faNum(n: number): string {
  return n.toLocaleString("fa-IR");
}

export function toman(n: number): string {
  return `${faNum(n)} تومان`;
}

export function faDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
}

// تاریخ امروز به شکل YYYY-MM-DD (برای مقایسه با اعتبار پیش‌فاکتور)
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
