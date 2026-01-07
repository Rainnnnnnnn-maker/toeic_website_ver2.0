import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FavoritesProvider } from "@/context/FavoritesContext";
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
  metadataBase: new URL("https://toeic-words.com"),
  title: {
    default: "TOEIC重要単語",
    template: "%s | TOEIC重要単語",
  },
  description: "TOEIC頻出の重要単語をAI解説で効率よく学べる",
  icons: {
    icon: "/favicon.ico",
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
    description: "TOEIC頻出の重要単語をAI解説で効率よく学べる",
    url: "https://toeic-words.com",
    siteName: "TOEIC重要単語集",
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
    description: "TOEIC頻出の重要単語をAI解説で効率よく学べる",
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
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<FavoritesProvider>
					{children}
				</FavoritesProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
