import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "@/components/features/auth/LoginClient";

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
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Suspense fallback={null}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
