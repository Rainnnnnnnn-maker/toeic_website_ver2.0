# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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

## Architecture

### Tech Stack
- **Next.js 16.2** — App Router with `reactCompiler: true` and `cacheComponents: true`
- **React 19** with React Compiler (automatic memoization via `babel-plugin-react-compiler`) — do not add `useMemo`/`useCallback` manually
- **Tailwind CSS 3.4** — utility-first only; minimize arbitrary CSS
- **TypeScript 5** strict mode — import alias `@/` maps to `src/`
- **AI**: Google Gemini (`@google/genai`, model: `gemini-2.5-flash-lite`)
- **Cache L2**: Upstash Redis (`@upstash/redis`)
- **Storage**: Vercel Blob (word lists in production)
- **TTS**: Google Cloud Text-to-Speech (HTTP API)
- **Deploy**: Vercel (preview on all branches; production via manual `workflow_dispatch`)

### Word List Data Flow

In `NODE_ENV=development`, word lists are read from `__doc__/word.txt`, `__doc__/word_mid.txt`, `__doc__/word_high.txt` (one word per line). In production, they are fetched from Vercel Blob. This branching is centralized entirely in `src/data/words.ts` — do not add any other data loading path.

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

- All modules that touch secrets or server-only APIs must start with `import "server-only"`.
- Only `NEXT_PUBLIC_*` env vars may be used client-side.
- Navigation links use `prefetch={false}` site-wide to reduce Vercel Edge Requests. Use the existing `WordLinkPending` pattern (via `useLinkStatus`) for click-feedback on links that need a loading pulse.
  - Counterintuitive gotcha: on Suspense-streaming pages (e.g. `/words/[word]`, where `page.tsx` wraps the data fetcher in `<Suspense fallback={<Loading />}>`), `prefetch={false}` *disables* the instant `loading.tsx` skeleton — prefetch is what caches the loading shell so it can render on click. Without prefetch the router waits on the current page, so the skeleton never visibly fires. Enable prefetch only when you intentionally want that fallback to show.

### TTS API (`POST /api/tts`)

The TTS endpoint has a strict allowlist to prevent quota abuse:
- Single English words must exist in the vocabulary list (`getWordBySlug`).
- Example sentences must exactly match a `toeicExamples` or `meanings[].detailedMeanings[].example` entry for the given `wordSlug` (after whitespace normalization).
- Rate limit: 30 req/min per IP via Upstash Ratelimit (sliding window); cached results bypass the counter.
- TTS cache keys: `tts:en:word:<slug>` for single words; `tts:<lang>:<wordSlugTag>:<sha256_12>` for sentences (30-day TTL).

### Cache Invalidation APIs

All revalidation endpoints require `?token=<REVALIDATION_TOKEN>`:

| Endpoint | What it clears |
|---|---|
| `GET /api/revalidate/words` | L1 `word-list` tag (word lists) |
| `GET /api/revalidate/today-words` | L1 `today-recommended-words` tag (also accepts `Authorization: Bearer <CRON_SECRET>`) |
| `GET /api/revalidate/word?slug=<slug>` | L1 `word-detail-<slug>` tag; add `&upstash=true` to also clear L2 |
| `GET /api/revalidate/upstash-word?key=word:<slug>` | L2 Redis key only |

### Listen Mode (Audio Sequencing)

`TodayWordsListenClient` and `FavoritesListenClient` use a ref-based state machine (`audioRef`, `stepRef`, `indexRef`, `playingRef`) to sequence "word → English example → Japanese example" per word. The `audio.onended` handler checks whether it is still the active audio instance before advancing to avoid race conditions. Example text is extracted via `pickExample(detail)` (falls back from `toeicExamples[0]` → `meanings[0].detailedMeanings[0]`).

## Key Conventions

### Routing Structure
- `src/app/(web-info)/` — layout group for About, Privacy, Terms, Contact, Guide pages
- `src/app/words/[word]/` — SSG word detail pages (`generateStaticParams` generates all slugs at build time)
- `src/app/api/` — Route Handlers only; no UI logic here

### Document Update Rule
Any feature change must update **both** `README.md` and `.trae/documents/技術ドキュメント.md` (including the "最終更新日") in the same commit or PR.

### Testing
**Unit tests (Vitest) cover pure logic only**; integration/UI is still verified by manual smoke test.

- Pure, side-effect-free logic lives in `src/lib/*.ts` and is unit-tested in `src/lib/(tests)/*.test.ts` files (`environment: "node"`, no secrets required). Current suites: `word-select` (parsing/dedup, FNV-1a hash, JST day key, daily selection), `word-detail-parse` (Gemini JSON extraction + normalization), `tts-utils` (text normalization, slug sanitization, cache keys, example allowlist matching), `listen-utils` (`pickExample` fallback).
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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (production word lists) |
| `REVALIDATION_TOKEN` | Protects `/api/revalidate/*` endpoints |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 |
| `BLOB_URL_IMPORTANT` / `BLOB_URL_MEDIUM` / `BLOB_URL_HIGH` | Optional direct Blob URLs (skips `list` call) |
| `WORD_CACHE_TTL_DAYS` | Redis TTL in days (default: 30) |
