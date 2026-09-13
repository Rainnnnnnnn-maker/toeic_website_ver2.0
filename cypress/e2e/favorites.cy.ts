import { FAVORITES_STORAGE_KEY } from "../../src/lib/favorites-sync";

describe("Guest favorites persistence", () => {
  it("keeps additions and deletions after reload", () => {
    cy.visit("/today-words");
    cy.get('main a[href^="/words/"]').first().invoke("attr", "href").then((href) => {
      const slug = new URL(href!, "http://localhost").pathname.split("/").pop()!;
      cy.get('main a[href^="/words/"]').first().click();
      cy.location("pathname").should("eq", `/words/${slug}`);
      cy.get('button[aria-label="お気に入りに追加"]').should("be.visible").click();
      cy.get('button[aria-label="お気に入りから削除"]').should("be.visible");

      cy.reload();
      cy.get('button[aria-label="お気に入りから削除"]').should("be.visible");
      cy.visit("/favorites");
      cy.get(`main a[href^="/words/${slug}?"]`).should("have.length", 1).click();
      cy.get('button[aria-label="お気に入りから削除"]').click();
      cy.get('button[aria-label="お気に入りに追加"]').should("be.visible");

      cy.reload();
      cy.get('button[aria-label="お気に入りに追加"]').should("be.visible");
      cy.visit("/favorites");
      cy.contains("お気に入りの単語はまだありません").should("be.visible");
      cy.reload();
      cy.contains("お気に入りの単語はまだありません").should("be.visible");
      cy.get(`main a[href^="/words/${slug}?"]`).should("not.exist");
    });
  });
});

describe("Guest favorites search", () => {
  const cards = 'main a[href$="?from=favorites"]';

  it("filters the list by term prefix", () => {
    cy.visit("/favorites", {
      onBeforeLoad(win) {
        win.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(["ability", "accept", "accounting"]));
      },
    });
    cy.get(cards).should("have.length", 3);

    cy.get("#favorites-search").type("ACC");
    cy.get(cards).should("have.length", 2);
    cy.get('main a[href="/words/accounting?from=favorites"]').should("exist");
    cy.get('main a[href="/words/accept?from=favorites"]').should("exist");
    cy.contains("2件 / 全3件").should("be.visible");

    cy.get("#favorites-search").clear().type("accept");
    cy.get(cards).should("have.length", 1).and("have.attr", "href", "/words/accept?from=favorites");

    // 前方一致のみ: "accounting" の途中にある "count" では一致しない
    cy.get("#favorites-search").clear().type("count");
    cy.get(cards).should("not.exist");
    cy.contains("「count」で始まるお気に入り単語はありません").should("be.visible");

    cy.contains("button", "検索をクリア").click();
    cy.get("#favorites-search").should("have.value", "").and("be.focused");
    cy.get(cards).should("have.length", 3);
  });
});
