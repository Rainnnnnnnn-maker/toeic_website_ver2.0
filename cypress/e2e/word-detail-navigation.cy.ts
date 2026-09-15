import { FAVORITES_STORAGE_KEY } from "../../src/lib/favorites-sync";

// Next.js Cache Components retains previous pages in hidden Activity trees.
// Assert against the currently displayed page, not retained DOM.
const nav = 'nav[aria-label="単語ナビゲーション"]:visible';

// "accept" sits between the other two favorites, so favorites-based navigation links both ways.
const visitWithFavorites = (path: string) =>
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(["ability", "accept", "accounting"]));
    },
  });

describe("Word detail previous/next navigation", () => {
  it("is hidden for every review queue so ungraded cards cannot be previewed", () => {
    const cases = [
      { search: "?from=review&queue=due", backHref: "/review?queue=due" },
      { search: "?from=review&queue=weak", backHref: "/review?queue=weak" },
      { search: "?from=review&queue=all", backHref: "/review?queue=all" },
      { search: "?from=review", backHref: "/review" },
    ];
    for (const { search, backHref } of cases) {
      visitWithFavorites(`/words/accept${search}`);
      // The return link exists only after the client header replaces the Suspense fallback.
      cy.contains("header a:visible", "次の単語へ").should("have.attr", "href", backHref);
      cy.get(nav).should("not.exist");
    }
  });

  it("stays available when browsing favorites", () => {
    visitWithFavorites("/words/accept?from=favorites");
    cy.contains(`${nav} a`, "前単語").should("have.attr", "href", "/words/accounting?from=favorites");
    cy.contains(`${nav} a`, "次単語").should("have.attr", "href", "/words/ability?from=favorites");
  });
});
