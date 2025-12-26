import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
	keywords: ["TOEIC", "英単語", "単語帳", "学習", "例文"],
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
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
