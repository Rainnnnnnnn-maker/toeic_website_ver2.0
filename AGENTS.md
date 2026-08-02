# AGENTS.md

This file is the single source of truth for coding-agent guidance in this repository. Codex reads it directly; Claude Code reads it through the `@AGENTS.md` import in `CLAUDE.md`. Add project guidance here — never to `CLAUDE.md`.

## Commands

```bash
npm ci                  # Install dependencies (prefer over npm install)
npm run dev             # Start development server at http://localhost:3000
npm run build           # Production build (also validates TypeScript)
npm run lint            # Run ESLint (must pass before merging)
npm run start           # Start production server after build
npm run test            # Run Vitest unit tests (pure-logic only — see Testing below)
```

**CI runs `npm run lint` and `npm run test`.** The `npm run build` step in `.github/workflows/ci.yml` is commented out and should be run locally before pushing.

### Build Troubleshooting (Repository-Specific)

Production builds switch the word-list loader to Vercel Blob, so a complete build requires outbound network access to the configured `BLOB_URL_*` / Vercel Blob host.

- Start with one normal `npm run build` attempt. Do not run build, lint, and tests concurrently when diagnosing a build problem.
- If Turbopack remains at `Creating an optimized production build ...` with no new output for 60 seconds, treat it as stalled. Stop it once and switch to `npm run build -- --webpack`; do not repeatedly retry Turbopack.
- Continue subsequent retries with the same Webpack command so each retry changes only one variable.
- If TypeScript reports a nonexistent implicit type library such as `chai 2`, inspect `node_modules/@types` for empty duplicate directories ending in ` 2`. This is a corrupted local dependency tree, not a `tsconfig` issue. Run `npm ci` once, then retry the Webpack build; do not edit TypeScript configuration to mask it.
- If page-data collection fails with `ENOTFOUND` for `*.public.blob.vercel-storage.com`, rerun the same Webpack build with network/escalated sandbox permission immediately. Do not retry inside the restricted sandbox.
- A known-good Webpack build (2026-07-22) compiled in about 2 seconds, type-checked in about 2 seconds, and generated 2,778 static pages in about 13 seconds. The page count alone is not a reason to wait through a silent multi-minute compile.
- Retry budget: one normal build, at most one dependency cleanup when evidence requires it, and one network-enabled Webpack build. If that still fails, report the exact failing stage instead of looping.

## Architecture

### Tech Stack
- **Next.js 16.2** — App Router with `reactCompiler: true` and `cacheComponents: true`
- **React 19** with React Compiler (automatic memoization via `babel-plugin-react-compiler`) — do not add `useMemo`/`useCallback` manually
- **Tailwind CSS 3.4** — utility-first only; minimize arbitrary CSS
- **TypeScript 5** strict mode — import alias `@/` maps to `src/`
- **AI**: Google Gemini (`@google/genai`, models: `gemini-2.5-flash-lite` for word details, `gemini-embedding-001` for semantic-search embeddings)
- **Cache L2**: Upstash Redis (`@upstash/redis`)
- **Vector Search**: Upstash Vector (`@upstash/vector`) — 768-dim cosine index for semantic word search
- **Storage**: Vercel Blob (word lists in production)
- **TTS**: Google Cloud Text-to-Speech (HTTP API)
- **Deploy**: Vercel (preview on all branches; production via manual `workflow_dispatch`)

### Word List Data Flow

In `NODE_ENV=development`, word lists are read from `__words__/word.txt`, `__words__/word_mid.txt`, `__words__/word_high.txt` (one word per line). In production, they are fetched from Vercel Blob. This branching is centralized entirely in `src/lib/word-source.ts` (`resolveDefaultWordSource()` / `loadWordData()`) — do not add any other data loading path. `src/data/words.ts` is the cached server entry point (`'use cache'` + `cacheTag('word-list')`) that wraps it; `scripts/embed-words.ts` calls the same loader directly so the embedded corpus always matches the served one. `word-source.ts` carries no `server-only` marker (the CLI must import it) but pulls in `@vercel/blob` and `node:fs` — never import it from a client component.

Setting `BLOB_URL_IMPORTANT`, `BLOB_URL_MEDIUM`, `BLOB_URL_HIGH` skips the Blob `list` operation and fetches directly from those URLs (faster, fewer API calls).

### Multi-Layer Cache for Word Details

`src/data/word-detail.ts:getWordDetail(slug)` is the single entry point for word detail data:

1. **L1** — Next.js Data Cache (`"use cache"` + `cacheLife("max")` + `cacheTag("word-detail-${slug}", "word-detail")`)
2. **L2** — Upstash Redis (`src/lib/wordCache.ts`, key: `word:<slug>`, TTL: `WORD_CACHE_TTL_DAYS` days)
3. **L3** — Google Gemini generation → normalize → write to Redis

Never call Gemini directly. Always go through `getWordDetail`. For client-side access, use the Server Action `fetchWordDetail` from `src/actions/word.ts` (it wraps `getWordDetail` and swallows exceptions, returning `null` on failure).

### Today's 5 Recommended Words

`getTodayRecommendedWords(limit)` in `src/data/words.ts` is a Cache Component (`'use cache'` + `cacheTag('today-recommended-words')` + `cacheLife('days')`). It picks words deterministically by UTC-based JST date key + FNV-1a hash of each slug. **The daily rotation is triggered by Vercel Cron** at UTC 22:05 (= JST 7:05) via `/api/revalidate/today-words`, which calls `revalidateTag('today-recommended-words')`. Client components that display these words are dumb — they receive the 5 words as props, never run selection logic themselves.

### Server/Client Boundary

- All modules in the Next.js application graph that touch secrets or server-only APIs must start with `import "server-only"`.
- Standalone Node/`tsx` CLI entry points under `scripts/` must not import `server-only`: outside the React Server condition its default entry throws immediately. Keep those modules unreachable from Client Components instead. Shared CLI modules such as `src/lib/word-source.ts` follow the same exception and must never be imported client-side.
- Only `NEXT_PUBLIC_*` env vars may be used client-side.
- Navigation links use `prefetch={false}` site-wide to reduce Vercel Edge Requests. Use the existing `WordLinkPending` pattern (via `useLinkStatus`) for click-feedback on links that need a loading pulse.
  - Counterintuitive gotcha: on Suspense-streaming pages (e.g. `/words/[word]`, where `page.tsx` wraps the data fetcher in `<Suspense fallback={<Loading />}>`), `prefetch={false}` *disables* the instant `loading.tsx` skeleton — prefetch is what caches the loading shell so it can render on click. Without prefetch the router waits on the current page, so the skeleton never visibly fires. Enable prefetch only when you intentionally want that fallback to show.

### TTS API (`POST /api/tts`)

The TTS endpoint has a strict allowlist to prevent quota abuse:
- Single English words must exist in the vocabulary list (`getWordBySlug`).
- Example sentences must exactly match a `toeicExamples` or `meanings[].detailedMeanings[].example` entry for the given `wordSlug` (after whitespace normalization).
- Rate limit: 30 req/min per IP via Upstash Ratelimit (sliding window); cached results bypass the counter.
- TTS cache keys: `tts:en:word:<slug>` for single words; `tts:<lang>:<wordSlugTag>:<sha256_12>` for sentences (30-day TTL).
- Send `TTS_API_KEY` to Google only through the `x-goog-api-key` request header. Never place it in the URL or response payload.

### Semantic Search（意味で探す）

`POST /api/search/semantic` finds words by meaning (Japanese/English queries) via Upstash Vector:

- Each word = one document: `buildEmbeddingText` (in `src/lib/semantic-search.ts`, pure) composes WordDetails (definitions, synonyms, examples) into text, embedded with `gemini-embedding-001` at **768 dims** (`EMBEDDING_DIMENSION`). Non-3072-dim outputs are NOT pre-normalized by Gemini, so `normalizeVector` (L2) is always applied before upsert/query. The Upstash Vector index must be created with 768 dims / cosine.
- Backfill: `npm run embed:words` (`scripts/embed-words.ts`, standalone via `tsx --env-file=.env.local`). Reads WordDetails from Redis (`word:<slug>`), generates missing ones with Gemini, then embeds and upserts (metadata: `slug`/`term`/`level`/`japaneseTranslation`). The word list comes from the shared `src/lib/word-source.ts` loader, so it defaults to the same Vercel Blob corpus the site serves. After a complete successful Blob run, range the Vector index and delete word-vector IDs absent from the current corpus before incrementing `semsearch:index-version`. Never prune after `--limit`, `--only-cached`, `--source=local`, or a generation failure. Flags: `--dry-run`, `--limit=N`, `--only-cached`, `--source=local|blob`.
- Keeping vectors in sync: `/api/revalidate/word?...&vector=true` re-fetches the detail via `getWordDetailFresh` (L1-bypassing export from `src/data/word-detail.ts`) and re-upserts the embedding. A successful upsert increments `semsearch:index-version`; WordDetails regeneration without `vector=true` leaves the old embedding in place.
- Query path: normalize (NFKC/trim/lowercase) → read the Vector generation → Redis top-K candidate cache (`semsearch:v3:<indexVersion>:<sha256_16>`, 7-day TTL, empty candidate sets never cached; bypassed when generation lookup fails) → rate limit 20 req/min per IP (`rl:semsearch`, cached queries bypass) → embed query (`RETRIEVAL_QUERY`) → `vector.query(topK=10)` → cache valid candidates → filter candidates below `SEMANTIC_SEARCH_MIN_SCORE` (default `0.82`, reapplied on every cache read) → slugs/metadata back to the client. Requires the same `X-App-Source: toeic-client` + same-origin headers as `/api/tts`. The query text is sent to Gemini but not to GA4; analytics receives only query length and result count.
- UI: 「意味で探す」tab in `WordsExplorerClient` renders `SemanticSearchPanel` (client). Results link to `/words/[slug]`. The TOP page hosts `SemanticSearchLauncher` (no results UI). It saves the query in same-tab `sessionStorage` via `semantic-launch-store.ts`, then navigates with only an opaque ID (`/words?mode=meaning&launch=...#word-explorer`) so the query never enters request URLs or GA4 `page_location`. `WordsExplorerClient` reads params with Next.js `useSearchParams` inside a Suspense boundary, so browser back/forward updates the UI. The stored query itself is read via `useSyncExternalStore` whose server snapshot is always `""` — `sessionStorage` is unreadable during SSR, so reading it in render would desync hydration; after hydration the `SemanticSearchPanel` `key` flips once to remount it with the resolved query. `SemanticSearchPanel` auto-runs `initialQuery` once and shares identical in-flight requests to absorb React Strict Mode effect replays. URL validation/pure logic lives in `src/lib/semantic-launch.ts`.

### Cache Invalidation APIs

All revalidation endpoints require `?token=<REVALIDATION_TOKEN>`:

| Endpoint | What it clears |
|---|---|
| `GET /api/revalidate/words` | L1 `word-list` tag (word lists) |
| `GET /api/revalidate/today-words` | L1 `today-recommended-words` tag (also accepts `Authorization: Bearer <CRON_SECRET>`) |
| `GET /api/revalidate/word?slug=<slug>` | L1 `word-detail-<slug>` tag; add `&upstash=true` to also clear L2; add `&vector=true` to re-embed/upsert into Upstash Vector and increment the semantic-index generation |
| `GET /api/revalidate/upstash-word?key=word:<slug>` | L2 Redis key only |

### Listen Mode (Audio Sequencing)

`TodayWordsListenClient` and `FavoritesListenClient` use a ref-based state machine (`audioRef`, `stepRef`, `indexRef`, `playingRef`) to sequence "word → English example → Japanese example" per word. The `audio.onended` handler checks whether it is still the active audio instance before advancing to avoid race conditions. Example text is extracted via `pickExample(detail)` (falls back from `toeicExamples[0]` → `meanings[0].detailedMeanings[0]`).

## Key Conventions

### Routing Structure
- `src/app/(web-info)/` — layout group for About, Privacy, Terms, Contact, Guide pages
- `src/app/words/[word]/` — SSG word detail pages (`generateStaticParams` generates all slugs at build time)
- `src/app/api/` — Route Handlers only; no UI logic here

### Project Skills
Repository-specific skills live in `.trae/skills/`, symlinked into `.claude/skills/` and `~/.codex/skills/` so every agent resolves the same `SKILL.md`. Edit the files under `.trae/skills/` only — never the symlinks.

Word-list operations (syncing from Vercel Blob, alphabetical sorting, deduplication) each have a dedicated skill. Read the relevant `SKILL.md` before editing `__words__/*.txt` by hand. Do not maintain a list of skill names here; each skill's `description` frontmatter is the single source of truth and agents load it automatically.

### Document Update Rule
Any feature change must update **both** `README.md` and `.trae/documents/技術ドキュメント.md` (including the "最終更新日") in the same commit or PR.

### Testing
**Unit tests (Vitest) cover pure logic only**; integration/UI is still verified by manual smoke test.

- Pure, side-effect-free logic lives in `src/lib/*.ts` and is unit-tested in `src/lib/(tests)/*.test.ts` files (`environment: "node"`, no secrets required). Current suites: `word-select` (parsing/dedup, FNV-1a hash, JST day key, daily selection), `word-detail-parse` (Gemini JSON extraction + normalization), `tts-utils` (text normalization, slug sanitization, cache keys, example allowlist matching), `listen-utils` (`pickExample` fallback), `favorites-sync` (stored-favorites parsing, merge logic), `safe-compare` (constant-time token comparison), `study-utils` (study-mode pool selection/re-draw with injectable random, persisted-state parsing, sentence highlight splitting), `semantic-search` (query normalization, index-versioned cache keys, minimum-score filtering, vector normalization, embedding-document building, vector-match/cached-result parsing).
- When extracting testable logic out of a `server-only` module, put the pure function in `src/lib/` (no `server-only`, type-only imports for server types) and have the server module import it — never duplicate.
- Do **not** add tests that require Gemini/Redis/Blob/TTS or render React components; cover those by manual testing.

Before merging:
1. `npm run lint` — must pass
2. `npm run test` — must pass (also runs in CI)
3. `npm run build` — must succeed locally
4. Manual smoke test of the affected feature in `npm run dev`

### OGP Font Loading (Known Fragility)
`src/lib/og-utils.ts:loadGoogleFont` uses a regex to parse Google Fonts CSS. The current parser only matches `opentype`/`truetype` formats and may fail if Google serves `woff2` only. A fix is documented in `.trae/TODO_Refactoring1.md`.

### Environment Variables
Required in `.env.local` for local development:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Word detail generation |
| `TTS_API_KEY` | Google Cloud TTS |
| `UPSTASH_REDIS_REST_URL` | L2 cache |
| `UPSTASH_REDIS_REST_TOKEN` | L2 cache |
| `UPSTASH_VECTOR_REST_URL` | Semantic search (768-dim cosine index) |
| `UPSTASH_VECTOR_REST_TOKEN` | Semantic search |
| `SEMANTIC_SEARCH_MIN_SCORE` | Optional semantic-search minimum similarity score (default: `0.82`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (production word lists) |
| `REVALIDATION_TOKEN` | Protects `/api/revalidate/*` endpoints |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 |
| `BLOB_URL_IMPORTANT` / `BLOB_URL_MEDIUM` / `BLOB_URL_HIGH` | Optional direct Blob URLs (skips `list` call) |
| `WORD_CACHE_TTL_DAYS` | Redis TTL in days (default: 30) |
