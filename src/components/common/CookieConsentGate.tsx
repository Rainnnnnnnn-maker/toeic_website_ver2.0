import { cookies } from "next/headers";
import { CONSENT_COOKIE_NAME } from "@/lib/cookieConsent";
import { CookieConsent } from "./CookieConsent";

/**
 * Server-side gate for the cookie consent banner.
 *
 * Reading the consent cookie here (instead of localStorage on the client) lets
 * us decide at render time whether the banner needs to exist at all:
 * - undecided visitor → banner is part of the server-rendered output (no
 *   hydration delay, so it no longer becomes a late-painting LCP element)
 * - accepted/declined → nothing is rendered (no flash, not LCP-eligible)
 *
 * Reading cookies opts this subtree into dynamic rendering, so the caller must
 * wrap it in <Suspense> to keep the rest of the layout statically cacheable.
 *
 * NOTE: `CONSENT_COOKIE_NAME` is imported from `@/lib/cookieConsent` (a neutral
 * module), NOT from the "use client" `CookieConsent` component — exports of a
 * client module resolve to `undefined` on the server.
 */
export async function CookieConsentGate() {
  const decided = (await cookies()).get(CONSENT_COOKIE_NAME);
  if (decided) return null;
  return <CookieConsent />;
}
