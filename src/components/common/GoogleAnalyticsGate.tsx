import { GoogleAnalytics } from "@next/third-parties/google";
import { cookies } from "next/headers";
import {
  CONSENT_COOKIE_NAME,
  type ConsentValue,
} from "@/lib/cookieConsent";

/** GA4 は明示的に同意した訪問者にだけ読み込む。 */
export async function GoogleAnalyticsGate() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  const consent = (await cookies()).get(CONSENT_COOKIE_NAME)
    ?.value as ConsentValue | undefined;
  if (consent !== "true") return null;

  return <GoogleAnalytics gaId={gaId} />;
}
