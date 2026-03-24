# 1. Problems

The Open Graph image feature depends on loadGoogleFont in the opengraph module. The current implementation uses a fragile regex that only recognizes opentype/truetype and can fail to extract the actual font URL returned by Google Fonts, causing runtime errors and broken OGP images.

## 1.1. **Fragile CSS parsing (format filtering and greedy capture)**

- Location: src/lib/og-utils.ts (lines 1–12)
- Code parses Google Fonts CSS with `/src: url\((.+)\) format\('(opentype|truetype)'\)/`. This ignores modern `woff2` and uses a greedy `(.+)` group.
- Why it’s a problem:
  - Google Fonts commonly serves `woff2` first. When no opentype/truetype line exists, `resource` is null and the function throws, breaking OGP.
  - Greedy capture is brittle when multiple `src` declarations exist; it can over-capture and fail.

Problematic snippet:

```ts
export async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (resource) {
    const res = await fetch(resource[1]);
    return res.arrayBuffer();
  }
  throw new Error("failed to load font");
}
```

## 1.2. **Lack of resilience and caching**

- Call sites: src/app/opengraph-image.tsx (lines 24–27), src/app/words/\[word]/opengraph-image.tsx (lines 60–62)
- No fallback if parsing fails; any CSS change or transient network issue throws and breaks image generation.
- No cache hints are used; repeated font loads increase latency and external dependency risk.

# 2. Benefits

A robust parser and simple resilience substantially increase reliability of OGP generation.

## 2.1. **Reduced failures in OGP rendering**

- Handle `woff2` first, then fall back to `opentype/truetype`. Fewer runtime throws and broken images.
- Expectation: eliminate errors caused by CSS format changes; reduce incident rate to near zero for font parsing.

## 2.2. **Improved performance via caching**

- Using Next fetch hints or revalidation lowers repeated external calls.
- Estimated: font-load latency reduced by **30–60%** on warm paths (depends on cache and network proximity).

## 2.3. **Clearer, maintainable code**

- Non-greedy, global matching with explicit format priority makes intent obvious and future-proof.

# 3. Solutions

Adopt robust CSS parsing with explicit format priority (`woff2` → `opentype` → `truetype`) and add simple resilience/caching.

## 3.1. **Fix parsing and add fallback**

- Solution overview:
  - Parse all `src: url(...) format('...')` entries with a global, non-greedy regex.
  - Select the first available URL by format priority; throw only after all fallbacks fail.
  - Add `next` fetch options to enable caching/revalidation.
- Steps:
  - Replace the regex with a global variant capturing each `src` entry.
  - Implement format selection: `woff2` preferred, then `opentype`, then `truetype`.
  - Use `fetch(url, { next: { revalidate: 3600, tags: ['og-font'] } })` for CSS; font request may use the same hint.
  - Keep `text` param to minimize font subset size; retain error logging with controlled fallback.

Before:

```ts
const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
if (resource) {
  const res = await fetch(resource[1]);
  return res.arrayBuffer();
}
throw new Error("failed to load font");
```

After:

```ts
export async function loadGoogleFont(font: string, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl, { next: { revalidate: 3600, tags: ['og-font-css'] } })).text();

  const re = /src:\s*url\(([^)]+)\)\s*format\('([^']+)'\)/g; // non-greedy, global
  const candidates: { url: string; format: string }[] = [];
  for (;;) {
    const m = re.exec(css);
    if (!m) break;
    candidates.push({ url: m[1], format: m[2].toLowerCase() });
  }

  const pick = (f: string) => candidates.find(c => c.format === f)?.url;
  const chosenUrl = pick('woff2') ?? pick('opentype') ?? pick('truetype');
  if (!chosenUrl) {
    console.error('GoogleFont parse failed: no supported format');
    throw new Error('failed to load font');
  }

  const res = await fetch(chosenUrl, { next: { revalidate: 3600, tags: ['og-font-binary'] } });
  if (!res.ok) throw new Error(`failed to fetch font: ${res.status}`);
  return res.arrayBuffer();
}
```

- Why this works:
  - Global matching captures every `src` line; format priority ensures compatibility with modern CSS.
  - Cache hints reduce repeated network calls and latency in OGP routes.

## 3.2. **Optional: tolerate failures at call sites**

- If desired, wrap `loadGoogleFont` calls in a try/catch and render without the `fonts` property when fonts fail. OGP will still render with default fonts.

Example:

```ts
let fontData: ArrayBuffer | undefined;
try {
  fontData = await loadGoogleFont('Noto+Sans+JP', textToLoad);
} catch (e) {
  console.warn('OGP font unavailable, using fallback', e);
}

return new ImageResponse(tree, {
  ...size,
  ...(fontData ? { fonts: [{ name: 'Noto Sans JP', data: fontData, style: 'normal', weight: 700 }] } : {}),
});
```

# 4. Regression testing scope

Validate end-to-end OGP generation for both site-wide and per-word routes under varying font CSS structures and network conditions.

## 4.1. Main Scenarios

- Site OGP: GET `/opengraph-image` renders with Noto Sans JP, font loaded via `woff2`.
- Word OGP: GET `/words/{slug}/opengraph-image` renders with Noto Sans JP; translation text included.
- Cache warm: second request within an hour shows faster TTFB due to revalidation caching.

Suggested checks:

- Verify image renders (HTTP 200) and typography is correct.
- Confirm no errors in logs; ensure chosen format reflects CSS order.

## 4.2. Edge Cases

- Google Fonts CSS provides only `woff2`: parser selects it and succeeds.
- CSS includes multiple `src` lines: parser scans all and picks the preferred format.
- Only `truetype/opentype` present: fallback works.
- Transient network failure when fetching CSS or font: optional call-site fallback renders without `fonts`.
- Extremely long `text` subset: confirm URL encoding and CSS retrieval still succeed.

