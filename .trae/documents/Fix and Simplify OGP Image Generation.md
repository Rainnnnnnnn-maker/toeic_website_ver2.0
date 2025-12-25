I will fix the OGP image generation to be more reliable and consistent with your project's simple design.

### 1. Simplify `opengraph-image.tsx`
- **Design Update**: I will replace the current complex layout with a clean, minimal design that matches your "Not Found" and Home page aesthetics.
  - **Background**: A subtle radial gradient (blue-ish to white) to match the project theme.
  - **Content**: A centered card with the main title "TOEIC 重要単語集" and the subtitle "2026年版 / LEVEL UP YOUR SCORE".
- **Code Simplification**: I will remove the deeply nested divs and hardcoded styles that are currently causing clutter.

### 2. Optimize Font Loading
- **Fix Reliability**: The current font loader attempts to fetch a huge amount of unnecessary text, which can cause timeouts or errors.
- **Optimization**: I will restrict the font subset to *only* the characters actually used in the new simple design. This ensures faster and more reliable generation.

### 3. Verify Metadata
- I've confirmed that `layout.tsx` has the correct metadata configuration, so the main fix will be in the image generation file itself.

**Outcome**: A fast, reliable, and branded OGP image that works correctly when shared on social media.