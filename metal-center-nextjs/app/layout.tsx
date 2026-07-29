import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

const siteUrl = "https://metal-center-aqfg.vercel.app"; // بعداً با دامنه‌ی نهایی جایگزین شود

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "متال سنتر | پلتفرم هوشمند فولاد",
    template: "%s | متال سنتر",
  },
  description: "قیمت لحظه‌ای، استعلام آنی و شبکه‌ای معتبر از کارخانه‌های فولاد ایران — برای پیمانکاران، تولیدکنندگان و بازرگانان.",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "متال سنتر",
    title: "متال سنتر | پلتفرم هوشمند فولاد",
    description: "قیمت لحظه‌ای، استعلام آنی و شبکه‌ای معتبر از کارخانه‌های فولاد ایران.",
  },
};

// Organization Schema — به گوگل کمک می‌کند متال سنتر را به‌عنوان یک برند/شرکت واقعی بشناسد
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "متال سنتر",
  url: siteUrl,
  description: "پلتفرم هوشمند قیمت‌گذاری، تأمین و خرید فولاد",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="pb-24 lg:pb-0">
        <Header />
        <main className="animate-fade-in">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
