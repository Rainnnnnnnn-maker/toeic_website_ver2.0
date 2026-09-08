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
