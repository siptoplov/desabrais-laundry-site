import type { Metadata, Viewport } from "next";
import { Manrope, Michroma } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-manrope",
  display: "swap",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "VORQEN — цифровые продукты и AI-автоматизация бизнеса под ключ",
    template: "%s · VORQEN",
  },
  description: site.description,
  keywords: [
    "разработка сайтов",
    "веб-приложения",
    "AI-агенты",
    "автоматизация бизнеса",
    "чат-боты",
    "интеграции CRM",
    "бизнес под ключ",
    "VORQEN",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: site.url,
    siteName: "VORQEN",
    title: "VORQEN — BUILD / AUTOMATE / SCALE",
    description: "Мы создаём цифровые продукты и бизнесы под ключ. От идеи до масштабирования.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VORQEN — BUILD / AUTOMATE / SCALE",
    description: "Мы создаём цифровые продукты и бизнесы под ключ. От идеи до масштабирования.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VORQEN",
  url: site.url,
  slogan: "BUILD / AUTOMATE / SCALE",
  email: site.email,
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${michroma.variable}`} suppressHydrationWarning>
      <head>
        {/* Mark JS + loading before first paint so reveal states never flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js','is-loading');`,
          }}
        />
        <link rel="preload" as="image" href="/brand/emblem.webp" type="image/webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
