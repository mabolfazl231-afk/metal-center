"use client";

import { useState } from "react";

// لوگوی کارخانه را از public/factories/<slug>.<ext> می‌خواند.
// اگر فایلی پیدا نشد، حرف اول نام کارخانه نشان داده می‌شود.
const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

export default function FactoryLogo({
  slug,
  name,
  fallbackClassName = "text-3xl font-extrabold text-white/90",
}: {
  slug: string;
  name: string;
  fallbackClassName?: string;
}) {
  const [step, setStep] = useState(slug ? 0 : EXTENSIONS.length);

  if (step >= EXTENSIONS.length) {
    return <span className={fallbackClassName}>{name.charAt(0)}</span>;
  }

  return (
    <img
      src={`/factories/${slug}.${EXTENSIONS[step]}`}
      alt={name}
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
      className="max-h-full max-w-full object-contain"
    />
  );
}
