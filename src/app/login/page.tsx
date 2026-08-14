import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "@/components/features/auth/LoginClient";
import { LoginCardFallback } from "@/components/features/auth/LoginFallback";

export const metadata: Metadata = {
  title: "ログイン",
  description:
    "ログインすると、お気に入りの単語を複数の端末で同期できます。ログインは任意で、未ログインでもすべての機能を無料で利用できます。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] px-4 py-12">
      <Suspense fallback={<LoginCardFallback />}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
