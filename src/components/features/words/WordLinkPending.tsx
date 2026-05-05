"use client";

import { useLinkStatus } from "next/link";

export function WordLinkPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="absolute inset-0 rounded-md bg-blue-100/70 animate-pulse pointer-events-none"
    />
  );
}
