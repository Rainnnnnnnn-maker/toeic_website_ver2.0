// Shared cookie-consent constants.
//
// IMPORTANT: this module must NOT carry a "use client" directive. The Server
// Component `CookieConsentGate` reads the cookie name from here. If the constant
// lived in the "use client" `CookieConsent.tsx`, its exports would become client
// references on the server and `CONSENT_COOKIE_NAME` would resolve to `undefined`
// server-side — making `cookies().get(undefined)` always miss and the banner
// show on every request. Keep it in this neutral module imported by both sides.

export const CONSENT_COOKIE_NAME = "cookie-consent-accepted";

/** 1 year, in seconds. */
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentValue = "true" | "declined";
