// وضعیت‌ها و ابزارهای مشترک استعلام؛ هم پنل خریدار و هم پنل ادمین از این فایل استفاده می‌کنند.

export type RfqStatus = "submitted" | "reviewing" | "quoted" | "closed" | "cancelled";

export const RFQ_STATUSES: RfqStatus[] = ["submitted", "reviewing", "quoted", "closed", "cancelled"];

// استعلام‌هایی که هنوز در جریان‌اند
export const RFQ_ACTIVE: RfqStatus[] = ["submitted", "reviewing", "quoted"];

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

export function statusLabel(s: string): string {
  return RFQ_STATUS_LABEL[s as RfqStatus] ?? s;
}

export function statusStyle(s: string): string {
  return RFQ_STATUS_STYLE[s as RfqStatus] ?? "bg-black/5 text-ink/60";
}

// ارقام فارسی را لاتین می‌کند تا شماره‌ی موبایل درست ذخیره شود
export function toEn(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

export function faNum(n: number): string {
  return n.toLocaleString("fa-IR");
}

export function faDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
}
