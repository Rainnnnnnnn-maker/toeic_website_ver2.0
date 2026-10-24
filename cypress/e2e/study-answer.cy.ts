// Next.js Cache Components retains previous pages in hidden Activity trees.
// Assert against the currently displayed page, not retained DOM.
const detailLink = 'a:visible:contains("詳しい解説を見る")';
// The card loads its answer through the fetchWordDetail Server Action: a POST to the page with a Next-Action header.
const wordDetailAction = { method: "POST", pathname: "/study", headers: { "next-action": /.+/ } };
const gradeLabels = ["覚えている", "覚えていない", "あとで"];

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

  it("keeps every grade disabled until the answer has loaded", () => {
    cy.intercept(wordDetailAction, (req) => {
      req.continue((res) => {
        res.setDelay(3000);
      });
    });
    cy.visit("/study");
    cy.contains("button:visible", "答えを見る").click();

    for (const label of gradeLabels) {
      cy.contains("button:visible", label).should("be.disabled");
    }
    cy.contains("答えを読み込み中です").should("be.visible");

    cy.contains("p:visible", "テスト用の訳", { timeout: 10000 }).should("be.visible");
    for (const label of gradeLabels) {
      cy.contains("button:visible", label).should("be.enabled");
    }
  });

  it("allows only 「あとで」 and a retry when the answer fails to load", () => {
    cy.intercept(wordDetailAction, { statusCode: 500, body: "" });
    cy.visit("/study");
    cy.contains("button:visible", "答えを見る").click();

    cy.contains("button:visible", "再読み込み").should("be.visible");
    cy.contains("答えを読み込めないため").should("be.visible");
    cy.contains("button:visible", "覚えている").should("be.disabled");
    cy.contains("button:visible", "覚えていない").should("be.disabled");

    cy.contains("button:visible", "あとで").should("be.enabled").click();
    cy.location("pathname").should("eq", "/study");
    cy.contains("button:visible", "答えを見る").should("be.visible");
    cy.contains("h2:visible", "あとで確認").should("be.visible");
  });
});
