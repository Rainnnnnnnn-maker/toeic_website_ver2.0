import { CONSENT_COOKIE_NAME } from "../../src/lib/cookieConsent";

beforeEach(() => {
  // Cypress test isolation clears auth cookies and storage between tests.
  // Declining analytics also keeps the consent banner out of the click path.
  cy.setCookie(CONSENT_COOKIE_NAME, "declined");
});
