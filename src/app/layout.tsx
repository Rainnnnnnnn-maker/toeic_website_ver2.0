import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Footer } from "@/components/common/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.toeic-words.com"),
  applicationName: "TOEIC重要単語",
  title: {
    default: "TOEIC重要単語",
    template: "%s | TOEIC重要単語",
  },
  description: "【完全無料】TOEIC重要単語をAIが徹底解説！頻出単語を効率的に学習してスコアアップ。例文・類義語・発音も完備。",
  keywords: ["TOEIC", "重要単語", "頻出単語", "英単語", "学習", "アプリ", "無料", "600点", "730点", "800点", "AI解説"],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "96x96" },
      { url: "/icon.svg", type: "image/svg+xml" },
      //{ url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "TOEIC重要単語",
    description: "【完全無料】TOEIC重要単語をAIが徹底解説！頻出単語を効率的に学習してスコアアップ。例文・類義語・発音も完備。",
    url: "https://www.toeic-words.com",
    siteName: "TOEIC重要単語",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TOEIC重要単語",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOEIC重要単語",
    description: "【完全無料】TOEIC重要単語をAIが徹底解説！頻出単語を効率的に学習してスコアアップ。例文・類義語・発音も完備。",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3016015645741811"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <FavoritesProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </FavoritesProvider>
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
