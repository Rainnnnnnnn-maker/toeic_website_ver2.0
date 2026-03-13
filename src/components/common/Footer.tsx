"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-xs text-black/60 dark:text-white/60">
        <Link
          href="/"
          className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
        >
          トップへ
        </Link>
        <p>© {year ? `${year} ` : ""}TOEIC重要単語</p>
      </div>
    </footer>
  );
}
