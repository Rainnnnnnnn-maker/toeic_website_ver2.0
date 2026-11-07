import { FAVORITES_STORAGE_KEY } from "../../src/lib/favorites-sync";
import { STUDY_SAVED_WORDS_KEY } from "../../src/lib/study-saved-words";

// Cache Components retains hidden pages, so every interaction targets the active page.
const detailLink = 'a:visible:contains("詳しい解説を見る")';
const wordCard = 'section[aria-label="単語カード"]:visible';

function savedPanel(title: "覚えていない" | "あとで確認") {
  return cy.contains("aside:visible h2", new RegExp(`^${title}$`)).closest("aside");
}

function gradeButton(label: "覚えている" | "覚えていない" | "あとで") {
  return cy.contains('section[aria-label="回答"]:visible button', new RegExp(`^${label}$`));
}

function revealCurrentSlug() {
  cy.contains("button:visible", "答えを見る").click();
  gradeButton("覚えていない").should("be.enabled");
  return cy.get(detailLink).invoke("attr", "href").then((href) => {
    return new URL(href!, "http://localhost").pathname.split("/").at(-1)!;
  });
}

function changeSavedWordsFromAnotherTab(raw: string) {
  cy.window().then((win) => {
    const oldValue = win.localStorage.getItem(STUDY_SAVED_WORDS_KEY);
    win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, raw);
    win.dispatchEvent(new win.StorageEvent("storage", {
      key: STUDY_SAVED_WORDS_KEY,
      oldValue,
      newValue: raw,
      storageArea: win.localStorage,
      url: win.location.href,
    }));
  });
}

function assertSavedWordsRaw(raw: string) {
  cy.window().should((win) => {
    expect(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)).to.equal(raw);
  });
}

describe("Saved study words", () => {
  it("accumulates forgotten words, moves a word to later, and restores both lists after reload and revisit", () => {
    cy.visit("/study");
    revealCurrentSlug().then((firstSlug) => {
      gradeButton("覚えていない").click();
      savedPanel("覚えていない").contains("button:visible", firstSlug).should("be.visible");

      revealCurrentSlug().then((secondSlug) => {
        expect(secondSlug).not.to.equal(firstSlug);
        gradeButton("覚えていない").click();
        savedPanel("覚えていない").find("li").should("have.length", 2);
        savedPanel("覚えていない").contains("button:visible", secondSlug).should("be.visible");

        // Selecting an accumulated word returns to its front; viewing the list cannot reveal the answer.
        savedPanel("覚えていない").contains("button:visible", firstSlug).click();
        cy.get(wordCard).should("contain.text", firstSlug);
        cy.get(detailLink).should("not.exist");
        cy.contains("button:visible", "答えを見る").should("be.visible");
        revealCurrentSlug().should("equal", firstSlug);
        gradeButton("あとで").click();

        const assertSavedLists = () => {
          savedPanel("覚えていない").find("li").should("have.length", 1);
          savedPanel("覚えていない").contains("button:visible", secondSlug).should("be.visible");
          savedPanel("あとで確認").find("li").should("have.length", 1);
          savedPanel("あとで確認").contains("button:visible", firstSlug).should("be.visible");
        };
        assertSavedLists();
        cy.scrollTo("top");
        cy.screenshot("study-saved-desktop", { capture: "viewport" });
        cy.window().should((win) => {
          expect(JSON.parse(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)!)).to.deep.equal({
            v: 1,
            forgottenSlugs: [secondSlug],
            laterSlugs: [firstSlug],
          });
        });

        cy.reload();
        assertSavedLists();
        cy.contains("main:visible header a", "単語一覧").click();
        cy.location("pathname").should("equal", "/");
        cy.contains("a:visible", "学習モード").click();
        cy.location("pathname").should("equal", "/study");
        assertSavedLists();
      });
    });
  });

  it("opens the two collapsed lists on mobile and selects a saved word without horizontal scrolling", () => {
    cy.viewport(375, 812);
    cy.fixture<{ important: string[]; medium: string[] }>("words.json").then((words) => {
      const forgottenSlug = words.important[0];
      const laterSlug = words.medium[0];
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, JSON.stringify({
            v: 1,
            forgottenSlugs: [forgottenSlug, "removed-from-the-corpus"],
            laterSlugs: [laterSlug],
          }));
        },
      });
      cy.contains("button:visible", "答えを見る").should("be.visible");
      savedPanel("覚えていない").find("li button").should("not.be.visible");
      savedPanel("あとで確認").find("li button").should("not.be.visible");
      savedPanel("覚えていない").contains('[role="status"]', "1語").should("be.visible");
      savedPanel("覚えていない").contains("button:visible", "一括お気に入り（1語）").should("be.visible");
      cy.get(wordCard).scrollIntoView();
      cy.screenshot("study-saved-mobile", { capture: "viewport" });

      cy.get('button[aria-label="覚えていないの一覧を開く"]:visible')
        .should("have.attr", "aria-expanded", "false").click()
        .should("have.attr", "aria-expanded", "true");
      savedPanel("覚えていない").contains("button:visible", forgottenSlug).should("be.visible");
      cy.get('button[aria-label="あとで確認の一覧を開く"]:visible').click();
      savedPanel("あとで確認").contains("button:visible", laterSlug).click();
      cy.get(wordCard).should("contain.text", laterSlug);
      cy.get(detailLink).should("not.exist");
      cy.contains("button:visible", "答えを見る").should("be.focused");

      cy.document().should((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
      });
    });
  });

  it("shows both lists at the end and removes a saved word after it is remembered", () => {
    cy.fixture<{ important: string[]; medium: string[] }>("words.json").then((words) => {
      const forgottenSlug = words.important[0];
      const laterSlug = words.medium[0];
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, JSON.stringify({
            v: 1,
            forgottenSlugs: [forgottenSlug],
            laterSlugs: [laterSlug],
          }));
        },
      });
      let detailHrefBeforeSummary: string;
      revealCurrentSlug();
      cy.get(detailLink).invoke("attr", "href").then((href) => {
        detailHrefBeforeSummary = href!;
      });
      cy.contains("button:visible", "学習を終えて確認").click();
      cy.get('main[aria-label="学習の振り返り"]:visible').should("be.visible");
      cy.contains("h1:visible", "保存した単語を確認").should("be.visible").and("be.focused");
      savedPanel("覚えていない").contains("button:visible", forgottenSlug).should("be.visible");
      savedPanel("あとで確認").contains("button:visible", laterSlug).should("be.visible");
      cy.screenshot("study-saved-summary", { capture: "viewport" });

      cy.contains("button:visible", "学習を続ける").click();
      cy.get('[aria-label$=" の答え"]:visible').should("be.focused");
      cy.get(detailLink).should(($link) => {
        expect($link.attr("href")).to.equal(detailHrefBeforeSummary);
      });
      cy.contains("button:visible", "学習を終えて確認").click();
      savedPanel("覚えていない").contains("button:visible", forgottenSlug).click();
      cy.get('main[aria-label="学習の振り返り"]:visible').should("not.exist");
      cy.get(wordCard).should("contain.text", forgottenSlug);
      cy.get(detailLink).should("not.exist");
      revealCurrentSlug().should("equal", forgottenSlug);
      gradeButton("覚えている").click();

      savedPanel("覚えていない").find("li").should("not.exist");
      savedPanel("あとで確認").contains("button:visible", laterSlug).should("be.visible");
      cy.reload();
      savedPanel("覚えていない").find("li").should("not.exist");
      cy.window().should((win) => {
        expect(JSON.parse(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)!)).to.deep.equal({
          v: 1,
          forgottenSlugs: [],
          laterSlugs: [laterSlug],
        });
      });
    });
  });

  it("adds every unfavorited forgotten word to favorites at once and keeps the list unchanged", () => {
    cy.fixture<{ important: string[]; medium: string[] }>("words.json").then((words) => {
      const [alreadyFavorite, newFavorite] = words.important;
      const laterSlug = words.medium[0];
      const savedWords = JSON.stringify({
        v: 1,
        forgottenSlugs: [alreadyFavorite, newFavorite],
        laterSlugs: [laterSlug],
      });
      const bulkButton = () => savedPanel("覚えていない").contains("button:visible", /一括お気に入り|すべてお気に入り済み/);
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([alreadyFavorite]));
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, savedWords);
        },
      });

      savedPanel("あとで確認").contains("button", /一括お気に入り|すべてお気に入り済み/).should("not.exist");
      savedPanel("覚えていない").contains("li", alreadyFavorite).should("contain.text", "お気に入り登録済み");
      savedPanel("覚えていない").contains("li", newFavorite).should("not.contain.text", "お気に入り登録済み");

      // Only the unfavorited word is counted and added; focus stays on the now-unavailable button.
      bulkButton().should("have.text", "一括お気に入り（1語）").and("have.attr", "aria-disabled", "false").click();
      bulkButton().should("have.text", "すべてお気に入り済み")
        .and("have.attr", "aria-disabled", "true")
        .and("be.focused");
      savedPanel("覚えていない").contains('[role="status"]', "1語をお気に入りに追加しました").should("be.visible");
      savedPanel("覚えていない").contains("li", newFavorite).should("contain.text", "お気に入り登録済み");
      savedPanel("覚えていない").find("li").should("have.length", 2);
      cy.window().should((win) => {
        expect(JSON.parse(win.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).to.deep.equal([alreadyFavorite, newFavorite]);
      });
      assertSavedWordsRaw(savedWords);

      // A second press is a no-op.
      bulkButton().click();
      cy.window().should((win) => {
        expect(JSON.parse(win.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).to.deep.equal([alreadyFavorite, newFavorite]);
      });

      cy.contains("button:visible", "学習を終えて確認").click();
      cy.get('main[aria-label="学習の振り返り"]:visible').should("be.visible");
      bulkButton().should("have.text", "すべてお気に入り済み").and("have.attr", "aria-disabled", "true");
      savedPanel("覚えていない").find("li").should("have.length", 2);

      cy.reload();
      bulkButton().should("have.text", "すべてお気に入り済み");
      cy.visit("/favorites");
      cy.get(`main a[href^="/words/${newFavorite}?"]`).should("have.length", 1);
    });
  });

  it("keeps grades usable in this tab when saving to localStorage is rejected", () => {
    cy.visit("/study", {
      onBeforeLoad(win) {
        const storagePrototype = Object.getPrototypeOf(win.localStorage) as Storage;
        const originalSetItem = storagePrototype.setItem;
        cy.stub(storagePrototype, "setItem").callsFake(function (this: Storage, key: string, value: string) {
          if (this === win.localStorage && key === STUDY_SAVED_WORDS_KEY) {
            throw new Error("Storage write rejected for this test");
          }
          originalSetItem.call(this, key, value);
        });
      },
    });
    revealCurrentSlug().then((slug) => {
      gradeButton("覚えていない").click();
      savedPanel("覚えていない").contains("button:visible", slug).should("be.visible");
      cy.contains('[role="status"]:visible', "このタブ内でのみ保持").should("be.visible");
      cy.window().should((win) => {
        expect(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)).to.equal(null);
      });

      savedPanel("覚えていない").contains("button:visible", slug).click();
      cy.get(wordCard).should("contain.text", slug);
      cy.get(detailLink).should("not.exist");
      revealCurrentSlug().should("equal", slug);
      gradeButton("あとで").click();
      savedPanel("覚えていない").find("li").should("not.exist");
      savedPanel("あとで確認").contains("button:visible", slug).should("be.visible");
      cy.window().should((win) => {
        expect(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)).to.equal(null);
      });
    });
  });

  it("refreshes saved lists when another tab changes localStorage", () => {
    cy.fixture<{ important: string[] }>("words.json").then((words) => {
      const slug = words.important[0];
      cy.visit("/study");
      cy.contains("button:visible", "答えを見る").should("be.visible");
      cy.window().then((win) => {
        const nextValue = JSON.stringify({ v: 1, forgottenSlugs: [], laterSlugs: [slug] });
        win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, nextValue);
        win.dispatchEvent(new win.StorageEvent("storage", {
          key: STUDY_SAVED_WORDS_KEY,
          oldValue: null,
          newValue: nextValue,
          storageArea: win.localStorage,
          url: win.location.href,
        }));
      });
      savedPanel("あとで確認").contains("button:visible", slug).should("be.visible");
      savedPanel("覚えていない").find("li").should("not.exist");
    });
  });

  it("does not create a saved-words entry when a remembered grade changes nothing", () => {
    cy.visit("/study");
    revealCurrentSlug();
    gradeButton("覚えている").click();
    cy.contains("button:visible", "答えを見る").should("be.visible");
    cy.window().should((win) => {
      expect(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)).to.equal(null);
    });
  });

  it("preserves unsupported saved data byte for byte through every grade, summary, and reload", () => {
    cy.fixture<{ important: string[]; medium: string[] }>("words.json").then((words) => {
      // Whitespace and an unknown field must survive as well as the unfamiliar version's lists.
      const original = `${JSON.stringify({
        v: 2,
        forgottenSlugs: [words.important[0]],
        laterSlugs: [words.medium[0]],
        futureSettings: { keep: true },
      }, null, 2)}\n`;
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, original);
        },
      });

      cy.contains("button:visible", "答えを見る").should("be.visible");
      cy.contains("p:visible", "以前の保存データを保護")
        .should("contain.text", "このタブ内");
      savedPanel("覚えていない").find("li").should("not.exist");
      savedPanel("あとで確認").find("li").should("not.exist");

      revealCurrentSlug();
      gradeButton("覚えている").click();
      assertSavedWordsRaw(original);
      revealCurrentSlug().then((forgottenSlug) => {
        gradeButton("覚えていない").click();
        savedPanel("覚えていない").contains("button:visible", forgottenSlug).should("be.visible");
        assertSavedWordsRaw(original);
        revealCurrentSlug().then((laterSlug) => {
          gradeButton("あとで").click();
          savedPanel("あとで確認").contains("button:visible", laterSlug).should("be.visible");
          assertSavedWordsRaw(original);

          cy.contains("button:visible", "学習を終えて確認").click();
          cy.get('main[aria-label="学習の振り返り"]:visible')
            .contains("p", "以前の保存データを保護")
            .should("contain.text", "このタブ内");
          assertSavedWordsRaw(original);
          cy.reload();
          cy.contains("button:visible", "答えを見る").should("be.visible");
          cy.contains("p:visible", "以前の保存データを保護").should("be.visible");
          savedPanel("覚えていない").find("li").should("not.exist");
          savedPanel("あとで確認").find("li").should("not.exist");
          assertSavedWordsRaw(original);
        });
      });
    });
  });

  it("protects the latest unsupported value when another tab replaces supported or unsupported data", () => {
    cy.fixture<{ important: string[]; medium: string[] }>("words.json").then((words) => {
      const supported = JSON.stringify({ v: 1, forgottenSlugs: [words.important[0]], laterSlugs: [] });
      const firstUnsupported = JSON.stringify({
        v: 2, forgottenSlugs: [words.important[1]], laterSlugs: [], futureRevision: 1,
      });
      const latestUnsupported = JSON.stringify({
        v: 2, forgottenSlugs: [], laterSlugs: [words.medium[0]], futureRevision: 2,
      });
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, supported);
        },
      });
      savedPanel("覚えていない").contains("button:visible", words.important[0]).should("be.visible");

      changeSavedWordsFromAnotherTab(firstUnsupported);
      cy.contains("p:visible", "以前の保存データを保護").should("be.visible");
      savedPanel("覚えていない").find("li").should("not.exist");
      revealCurrentSlug().then((slug) => {
        gradeButton("覚えていない").click();
        savedPanel("覚えていない").contains("button:visible", slug).should("be.visible");
      });
      assertSavedWordsRaw(firstUnsupported);

      revealCurrentSlug().then((slug) => {
        // The other tab's storage event may arrive after the next grade.
        // Saving must re-read the latest value even while using an in-memory list.
        cy.window().then((win) => {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, latestUnsupported);
        });
        gradeButton("あとで").click();
        savedPanel("あとで確認").contains("button:visible", slug).should("be.visible");
      });
      assertSavedWordsRaw(latestUnsupported);
    });
  });

  it("resumes durable saving from restored supported data without mixing in the protected tab's grades", () => {
    cy.fixture<{ important: string[] }>("words.json").then((words) => {
      const unsupported = JSON.stringify({ v: 2, forgottenSlugs: [words.important[0]], laterSlugs: [] });
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, unsupported);
        },
      });
      cy.contains("p:visible", "以前の保存データを保護").should("be.visible");
      revealCurrentSlug().then((temporarySlug) => {
        gradeButton("覚えていない").click();
        savedPanel("覚えていない").contains("button:visible", temporarySlug).should("be.visible");
        assertSavedWordsRaw(unsupported);

        const restoredSlug = words.important.find((slug) => slug !== temporarySlug)!;
        const restored = JSON.stringify({ v: 1, forgottenSlugs: [], laterSlugs: [restoredSlug] });
        changeSavedWordsFromAnotherTab(restored);
        cy.contains("p:visible", "以前の保存データを保護").should("not.exist");
        savedPanel("覚えていない").find("li").should("not.exist");
        savedPanel("あとで確認").find("li").should("have.length", 1);
        savedPanel("あとで確認").contains("button:visible", restoredSlug).click();
        revealCurrentSlug().should("equal", restoredSlug);
        gradeButton("覚えていない").click();
        cy.window().should((win) => {
          expect(JSON.parse(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)!)).to.deep.equal({
            v: 1, forgottenSlugs: [restoredSlug], laterSlugs: [],
          });
        });
      });
    });
  });

  it("keeps the valid saved words when one stored entry is not a string", () => {
    cy.fixture<{ important: string[]; medium: string[] }>("words.json").then((words) => {
      const forgottenSlug = words.important[0];
      const laterSlug = words.medium[0];
      cy.visit("/study", {
        onBeforeLoad(win) {
          win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, JSON.stringify({
            v: 1,
            forgottenSlugs: [forgottenSlug, 7],
            laterSlugs: [laterSlug],
          }));
        },
      });
      savedPanel("覚えていない").contains("button:visible", forgottenSlug).should("be.visible");
      savedPanel("あとで確認").contains("button:visible", laterSlug).should("be.visible");
    });
  });

  it("recovers from malformed saved data and persists the next grade", () => {
    cy.visit("/study", {
      onBeforeLoad(win) {
        win.localStorage.setItem(STUDY_SAVED_WORDS_KEY, "{invalid-json");
      },
    });
    savedPanel("覚えていない").contains("ここにたまります").should("be.visible");
    savedPanel("あとで確認").contains("ここから確認できます").should("be.visible");
    revealCurrentSlug().then((slug) => {
      gradeButton("覚えていない").click();
      savedPanel("覚えていない").contains("button:visible", slug).should("be.visible");
      cy.window().should((win) => {
        expect(JSON.parse(win.localStorage.getItem(STUDY_SAVED_WORDS_KEY)!)).to.deep.equal({
          v: 1,
          forgottenSlugs: [slug],
          laterSlugs: [],
        });
      });
    });
  });
});
