"use client";

import { useEffect, useRef, type ReactNode } from "react";

const mainClassName = [
  "relative flex w-full max-w-[960px] flex-col gap-5",
  "motion-safe:[&_[data-home-reveal=pending]]:opacity-0",
  "motion-safe:[&_[data-home-reveal=revealed]]:animate-homeReveal",
  "motion-safe:[&_[data-home-reveal]:focus-within]:transition-none",
  "motion-reduce:[&_[data-home-reveal]]:transition-none",
  "motion-safe:[&_[data-home-reveal-delay=short]]:[--home-reveal-delay:75ms]",
  "motion-safe:[&_[data-home-reveal-delay=long]]:[--home-reveal-delay:150ms]",
].join(" ");

export function HomeScrollReveal({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!main || reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const targets = Array.from(main.querySelectorAll<HTMLElement>("[data-home-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        if (!entry.isIntersecting || target.dataset.homeReveal !== "pending") continue;
        target.dataset.homeReveal = "revealed";
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });

    // HTML stays visible without JavaScript. Only prepare content still below the viewport.
    for (const target of targets) {
      if (target.getBoundingClientRect().top < window.innerHeight || target.contains(document.activeElement)) {
        target.dataset.homeReveal = "shown";
        continue;
      }
      target.dataset.homeReveal = "pending";
      observer.observe(target);
    }

    const revealFocusedTarget = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-home-reveal]");
      if (!target || !main.contains(target)) return;
      target.dataset.homeReveal = "shown";
      observer.unobserve(target);
    };
    const showAll = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      for (const target of targets) target.dataset.homeReveal = "shown";
    };

    main.addEventListener("focusin", revealFocusedTarget);
    reducedMotion.addEventListener("change", showAll);

    return () => {
      observer.disconnect();
      main.removeEventListener("focusin", revealFocusedTarget);
      reducedMotion.removeEventListener("change", showAll);
      for (const target of targets) target.dataset.homeReveal = "shown";
    };
  }, []);

  return <main ref={mainRef} className={mainClassName}>{children}</main>;
}
