"use client";

import { useState } from "react";
import Link from "next/link";
import {
  rebarKg,
  sheetKg,
  hollowKg,
  angleEqualKg,
  angleUnequalKg,
  IPE_KG_PER_M,
  UPN_KG_PER_M,
  parseNumber,
} from "@/lib/weight";

type Kind = "rebar" | "sheet" | "hollow" | "angle" | "ipe" | "upn";

const KINDS: { id: Kind; label: string }[] = [
  { id: "rebar", label: "میلگرد" },
  { id: "sheet", label: "ورق" },
  { id: "hollow", label: "قوطی / پروفیل" },
  { id: "angle", label: "نبشی" },
  { id: "ipe", label: "تیرآهن IPE" },
  { id: "upn", label: "ناودانی UPN" },
];

const REBAR_SIZES = [8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40];
const SHEET_TYPES = ["سیاه / ساده", "روغنی", "گالوانیزه", "آجدار"];

const INPUT =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue dark:border-border-dark dark:bg-surface-dark";

type Vals = {
  length: string;
  count: string;
  d: string;
  sheetT: string;
  sheetW: string;
  hollowW: string;
  hollowH: string;
  hollowT: string;
  angleH: string;
  angleB: string;
  angleT: string;
};

const DEFAULTS: Vals = {
  length: "12",
  count: "1",
  d: "12",
  sheetT: "",
  sheetW: "1500",
  hollowW: "",
  hollowH: "",
  hollowT: "",
  angleH: "",
  angleB: "",
  angleT: "",
};

type Result = { ok: true; perPiece: number; total: number; formula: string } | { ok: false; error: string };

function fail(error: string): Result {
  return { ok: false, error };
}

function calculate(kind: Kind, v: Vals, size: string): Result {
  const L = parseNumber(v.length);
  if (!(L > 0)) return fail("طول را به متر وارد کن.");

  const n = parseNumber(v.count);
  if (!(Number.isInteger(n) && n >= 1)) return fail("تعداد باید عدد صحیح و بزرگ‌تر از صفر باشد.");

  let kg = 0;
  let formula = "";

  switch (kind) {
    case "rebar": {
      kg = rebarKg(Number(v.d), L);
      formula = "0.006165375 × d² × L";
      break;
    }
    case "sheet": {
      const t = parseNumber(v.sheetT);
      const w = parseNumber(v.sheetW);
      if (!(t > 0 && w > 0)) return fail("ضخامت و عرض ورق را به میلی‌متر وارد کن.");
      kg = sheetKg(t, w, L);
      formula = "0.00785 × t × w × L";
      break;
    }
    case "hollow": {
      const w = parseNumber(v.hollowW);
      const h = parseNumber(v.hollowH);
      const t = parseNumber(v.hollowT);
      if (!(w > 0 && h > 0 && t > 0)) return fail("عرض، ارتفاع و ضخامت قوطی را به میلی‌متر وارد کن.");
      if (!(2 * t < Math.min(w, h))) return fail("ضخامت قوطی باید کمتر از نصف ضلع کوچک‌تر باشد.");
      kg = hollowKg(w, h, t, L);
      formula = "0.00785 × (w·h − (w−2t)·(h−2t)) × L";
      break;
    }
    case "angle": {
      const h = parseNumber(v.angleH);
      const T = parseNumber(v.angleT);
      const b = parseNumber(v.angleB);
      if (!(h > 0 && T > 0)) return fail("ضلع و ضخامت نبشی را به میلی‌متر وارد کن.");
      if (b > 0) {
        kg = angleUnequalKg(h, b, T, L);
        formula = "0.00785 × T × (h + b − T) × L";
      } else {
        kg = angleEqualKg(h, T, L);
        formula = "0.00785 × T × (2h − T) × L";
      }
      break;
    }
    case "ipe": {
      const perM = IPE_KG_PER_M[size];
      kg = perM * L;
      formula = `${perM} × L`;
      break;
    }
    case "upn": {
      const perM = UPN_KG_PER_M[size];
      kg = perM * L;
      formula = `${perM} × L`;
      break;
    }
  }

  if (!Number.isFinite(kg) || kg <= 0) return fail("نتیجه‌ی معتبری به دست نیامد؛ ورودی‌ها را بررسی کن.");
  return { ok: true, perPiece: kg, total: kg * n, formula };
}

function Field({
  label,
  value,
  onChange,
  unit,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-ink/60">
        {label}
        {unit && <span className="text-ink/40"> ({unit})</span>}
      </span>
      <input inputMode="decimal" className={INPUT} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="text-[11px] text-ink/40">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | number)[];
  unit?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-ink/60">
        {label}
        {unit && <span className="text-ink/40"> ({unit})</span>}
      </span>
      <select className={INPUT} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

const fmt = (n: number) => n.toLocaleString("fa-IR", { maximumFractionDigits: 2 });

export default function WeightCalculator() {
  const [kind, setKind] = useState<Kind>("rebar");
  const [vals, setVals] = useState<Vals>(DEFAULTS);
  const [size, setSize] = useState("IPE 120");
  const [sheetType, setSheetType] = useState(SHEET_TYPES[0]);

  const set = (key: keyof Vals) => (v: string) => setVals((prev) => ({ ...prev, [key]: v }));
  const result = calculate(kind, vals, size);

  function changeKind(k: Kind) {
    setKind(k);
    if (k === "ipe") setSize(Object.keys(IPE_KG_PER_M)[0]);
    if (k === "upn") setSize(Object.keys(UPN_KG_PER_M)[0]);
  }

  return (
    <div className="rounded-card border border-black/5 bg-white p-5 shadow-soft dark:border-border-dark dark:bg-surface-dark sm:p-7">
      {/* انتخاب نوع محصول */}
      <div role="tablist" aria-label="نوع محصول" className="mb-6 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            role="tab"
            aria-selected={kind === k.id}
            onClick={() => changeKind(k.id)}
            className={`rounded-pill px-4 py-2 text-xs font-bold transition ${
              kind === k.id ? "bg-blue text-white" : "bg-black/5 text-ink/70 hover:bg-blue/10"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:gap-8">
        {/* ورودی‌ها */}
        <div className="grid gap-4 sm:grid-cols-2">
          {kind === "rebar" && (
            <>
              <Select label="قطر میلگرد" unit="mm" value={vals.d} onChange={set("d")} options={REBAR_SIZES} />
              <Field label="طول" unit="متر" value={vals.length} onChange={set("length")} />
            </>
          )}

          {kind === "sheet" && (
            <>
              <Field label="ضخامت" unit="mm" value={vals.sheetT} onChange={set("sheetT")} hint="مثلاً ۲ یا ۳٫۵" />
              <Field label="عرض" unit="mm" value={vals.sheetW} onChange={set("sheetW")} />
              <Field label="طول" unit="متر" value={vals.length} onChange={set("length")} />
              <Select label="نوع ورق" value={sheetType} onChange={setSheetType} options={SHEET_TYPES} />
              <p className="text-[11px] leading-5 text-ink/45 sm:col-span-2">
                فرمول وزن پایه‌ی فولاد است. وزن پوشش روی ورق گالوانیزه و برجستگی آج ورق آجدار در این محاسبه نیست.
              </p>
            </>
          )}

          {kind === "hollow" && (
            <>
              <Field label="عرض" unit="mm" value={vals.hollowW} onChange={set("hollowW")} hint="برای قوطی مربع، برابر ارتفاع" />
              <Field label="ارتفاع" unit="mm" value={vals.hollowH} onChange={set("hollowH")} />
              <Field label="ضخامت" unit="mm" value={vals.hollowT} onChange={set("hollowT")} />
              <Field label="طول" unit="متر" value={vals.length} onChange={set("length")} />
              <p className="text-[11px] leading-5 text-ink/45 sm:col-span-2">
                گوشه‌ها تیز فرض شده‌اند. گردی گوشه و تلرانس ضخامت وزن واقعی را کمی تغییر می‌دهد.
              </p>
            </>
          )}

          {kind === "angle" && (
            <>
              <Field label="ضلع اول" unit="mm" value={vals.angleH} onChange={set("angleH")} />
              <Field label="ضلع دوم" unit="mm" value={vals.angleB} onChange={set("angleB")} hint="خالی بگذار برای نبشی مساوی" />
              <Field label="ضخامت" unit="mm" value={vals.angleT} onChange={set("angleT")} />
              <Field label="طول" unit="متر" value={vals.length} onChange={set("length")} />
              <p className="text-[11px] leading-5 text-ink/45 sm:col-span-2">
                این یک تخمین هندسی است. وزن استاندارد کارخانه برای نبشی دقیق‌تر است.
              </p>
            </>
          )}

          {kind === "ipe" && (
            <>
              <Select label="سایز تیرآهن" value={size} onChange={setSize} options={Object.keys(IPE_KG_PER_M)} />
              <Field label="طول" unit="متر" value={vals.length} onChange={set("length")} />
            </>
          )}

          {kind === "upn" && (
            <>
              <Select label="سایز ناودانی" value={size} onChange={setSize} options={Object.keys(UPN_KG_PER_M)} />
              <Field label="طول" unit="متر" value={vals.length} onChange={set("length")} />
            </>
          )}

          <Field label="تعداد" value={vals.count} onChange={set("count")} hint="تعداد شاخه یا ورق" />
        </div>

        {/* نتیجه */}
        <div className="flex flex-col justify-between gap-4 rounded-card bg-navy p-6 text-white">
          {result.ok ? (
            <>
              <div>
                <div className="text-xs font-bold text-[#B9C6DC]">وزن تئوری کل</div>
                <div className="mt-2 text-4xl font-extrabold tabular-nums">
                  {fmt(result.total)} <span className="text-base font-bold text-[#B9C6DC]">کیلوگرم</span>
                </div>
                {result.total >= 1000 && (
                  <div className="mt-1 text-sm text-[#B9C6DC]">
                    معادل {fmt(result.total / 1000)} تن
                  </div>
                )}
              </div>
              <div className="grid gap-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#B9C6DC]">وزن هر شاخه / ورق</span>
                  <span className="font-bold tabular-nums">{fmt(result.perPiece)} کیلوگرم</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#B9C6DC]">فرمول</span>
                  <span dir="ltr" className="font-mono text-xs">{result.formula}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm leading-7 text-[#B9C6DC]">{result.error}</p>
          )}

          <p className="text-[11px] leading-5 text-white/50">
            این وزن تئوری بر اساس ابعاد اسمی است. وزن باسکول و وزن استاندارد کارخانه ممکن است کمی متفاوت باشد.
          </p>
          <Link href="/rfq" className="inline-flex justify-center rounded-btn bg-white px-4 py-2.5 text-sm font-bold text-navy">
            استعلام قیمت همین محصول
          </Link>
        </div>
      </div>
    </div>
  );
}
