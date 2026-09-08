import { TODAY_WORDS_COUNT } from "../../src/lib/word-select";

// Next.js Cache Components retains previous pages in hidden Activity trees.
// Assert against the currently displayed page, not retained DOM.
const nav = 'nav[aria-label="単語ナビゲーション"]:visible';

describe("Today's displayed word order", () => {
  it("visits every displayed word forwards and backwards, including after reload", () => {
    cy.visit("/today-words");
    cy.get('main a[href^="/words/"]')
      .should("have.length", TODAY_WORDS_COUNT)
      .then(($links) => {
        // Capture the rendered order, without recomputing the daily selection.
        const slugs = [...$links].map((link) =>
          new URL((link as HTMLAnchorElement).href).pathname.split("/").pop()!
        );
        expect(new Set(slugs).size).to.eq(TODAY_WORDS_COUNT);

        const assertWord = (index: number) => {
          cy.location("pathname").should("eq", `/words/${slugs[index]}`);
          cy.location("search").should((search) => {
            const params = new URLSearchParams(search);
            expect(params.get("from")).to.eq("today");
            expect(JSON.parse(params.get("picks")!)).to.deep.eq(slugs);
          });
          cy.get("main h1:visible").should(($heading) => {
            expect($heading.text().trim().toLowerCase()).to.eq(slugs[index]);
          });
          if (index === 0) cy.contains(`${nav} a`, "前単語").should("not.exist");
          if (index === slugs.length - 1) cy.contains(`${nav} a`, "次単語").should("not.exist");
        };

        cy.wrap($links).first().click();
        assertWord(0);
        for (let index = 1; index < slugs.length; index++) {
          cy.contains(`${nav} a`, "次単語").should("be.visible").click();
          assertWord(index);
        }
        cy.reload();
        assertWord(slugs.length - 1);
        for (let index = slugs.length - 2; index >= 0; index--) {
          cy.contains(`${nav} a`, "前単語").should("be.visible").click();
          assertWord(index);
        }
      });
  });
});
