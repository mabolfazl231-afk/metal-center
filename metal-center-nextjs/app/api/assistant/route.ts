import { NextRequest, NextResponse } from "next/server";

// این API route روی سرور اجرا می‌شود (نه توی مرورگر کاربر)، پس کلید API اینجا امن است.
// نیاز به یک متغیر محیطی ANTHROPIC_API_KEY دارد (از console.anthropic.com گرفته می‌شود).
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "دستیار هوشمند هنوز فعال نشده. برای فعال‌سازی، یک کلید ANTHROPIC_API_KEY به تنظیمات پروژه در Vercel اضافه کنید.",
      },
      { status: 200 }
    );
  }

  const { message } = await req.json();

  const systemPrompt = `تو دستیار خرید فولاد برای پلتفرم متال سنتر هستی. به فارسی، مختصر و کاربردی جواب بده.
درباره‌ی انتخاب سایز و استاندارد میلگرد، تیرآهن، ورق و پروفیل راهنمایی کن.
اگر کاربر خواست خرید کند، پیشنهاد بده که از صفحه‌ی استعلام قیمت (/rfq) استفاده کند.
قیمت دقیق اعلام نکن چون قیمت لحظه‌ای است؛ کاربر را به صفحه‌ی /prices ارجاع بده.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const reply = data?.content?.[0]?.text ?? "متأسفم، پاسخی دریافت نشد. دوباره تلاش کنید.";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "خطا در ارتباط با دستیار هوشمند." }, { status: 200 });
  }
}
