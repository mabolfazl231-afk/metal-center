"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; text: string };

const STARTERS = [
  "برای سازه‌ی بتنی معمولی چه سایز میلگردی مناسبه؟",
  "فرق میلگرد A2 و A3 چیه؟",
  "برای سقف تیرآهنی چه سایزی نیاز دارم؟",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "سلام! من دستیار خرید فولاد متال سنتر هستم. درباره‌ی سایز، استاندارد یا نوع محصول موردنیازتان بپرسید." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const newMessages: Msg[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", text: "خطا در ارتباط. دوباره تلاش کنید." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col px-4 py-8">
      <div className="mb-4 text-center">
        <h1 className="mb-1 text-xl font-extrabold">✦ دستیار هوشمند خرید فولاد</h1>
        <p className="text-sm text-ink/50">سوال بپرسید، راهنمایی بگیرید، بعد از صفحه استعلام قیمت ثبت کنید.</p>
      </div>

      <div className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-card border border-black/5 bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-7 ${
                m.role === "user" ? "bg-blue text-white" : "bg-steel text-ink"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-ink/40">در حال تایپ...</div>}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/60"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="سوال خود را بنویسید..."
          className="flex-1 rounded-xl border border-black/10 bg-white p-3 text-sm"
        />
        <button
          onClick={() => send(input)}
          disabled={loading}
          className="rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          ارسال
        </button>
      </div>

      <Link href="/rfq" className="mt-4 text-center text-xs font-bold text-blue">
        آماده‌اید؟ درخواست استعلام قیمت ثبت کنید ←
      </Link>
    </div>
  );
}
