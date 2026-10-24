// Next.js Cache Components retains previous pages in hidden Activity trees.
// Assert against the currently displayed page, not retained DOM.
const detailLink = 'a:visible:contains("詳しい解説を見る")';

describe("Study mode answer reveal", () => {
  it("shows the answer before grading and stays in the session after 覚えていない", () => {
    cy.visit("/study");
    cy.contains("button:visible", "答えを見る").should("be.visible");
    cy.contains("button:visible", "覚えている").should("not.exist");

    // The hint shows only the example sentence, never the meaning.
    cy.contains("button:visible", "例文ヒントを見る").click();
    cy.contains("p:visible", "We study").should("be.visible");
    cy.contains("テスト用の訳").should("not.exist");

    cy.contains("button:visible", "答えを見る").click();
    cy.contains("p:visible", "テスト用の訳").should("be.visible");
    cy.contains("p:visible", "今日はこの単語を学習します。").should("be.visible");
    cy.get(detailLink).should("have.attr", "href").and("match", /^\/words\/[^/?]+\?from=study$/);

    cy.contains("button:visible", "覚えていない").click();
    cy.location("pathname").should("eq", "/study");
    cy.contains("button:visible", "答えを見る").should("be.visible");
    cy.get(detailLink).should("not.exist");
  });

  it("returns from the word detail to the same revealed card", () => {
    cy.visit("/study");
    cy.contains("button:visible", "答えを見る").click();
    cy.get(detailLink).invoke("attr", "href").then((href) => {
      cy.get(detailLink).click();
      cy.location("pathname").should("eq", new URL(href!, "http://localhost").pathname);
      cy.contains("header a:visible", "学習モード").click();

      cy.location("pathname").should("eq", "/study");
      cy.get(detailLink).should("have.attr", "href", href);
      cy.contains("button:visible", "覚えている").should("be.visible");
    });
  });
});
