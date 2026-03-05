# Tasks

- [ ] Task 1: Google Analytics (GA4) Integration
  - [ ] SubTask 1.1: Install `@next/third-parties` package (if not installed) or use `GoogleAnalytics` component.
  - [ ] SubTask 1.2: Add `GoogleAnalytics` component to `src/app/layout.tsx` with `gaId` from environment variable `NEXT_PUBLIC_GA_ID`.
  - [ ] SubTask 1.3: Verify no errors in build.

- [ ] Task 2: Internal Linking Enhancement - Logic
  - [ ] SubTask 2.1: Add `getRelatedWords` function to `src/data/words.ts` to fetch random words from the same level.
  - [ ] SubTask 2.2: Update `WordDetailFetcher` in `src/app/words/[word]/page.tsx` to fetch related words.

- [ ] Task 3: Internal Linking Enhancement - UI
  - [ ] SubTask 3.1: Update `WordDetailClient` to accept `relatedWords` prop.
  - [ ] SubTask 3.2: Render "関連単語" (Related Words) section at the bottom of the word detail page.
  - [ ] SubTask 3.3: Ensure synonyms in `detailedMeanings` (inside `WordDetailClient`) are also linked using `linkedWords` map.

- [ ] Task 4: FAQ Structured Data
  - [ ] SubTask 4.1: Create `faqJsonLd` object in `src/app/page.tsx` mapping the SEO content (Q&A style).
  - [ ] SubTask 4.2: Insert `Script` tag with JSON-LD in `Home` component.

# Task Dependencies
- Task 3 depends on Task 2.
