---
name: "ui-ux-expert"
description: "Expert in UI/UX design for Next.js & Tailwind CSS. Generates design systems, components, and ensures accessibility. Invoke when designing UI, creating components, or improving UX."
---

# UI/UX Expert

This skill acts as a professional UI/UX designer and frontend developer specialized in Next.js (App Router) and Tailwind CSS. It provides design intelligence, generates design systems, and implements accessible, responsive components.

## Core Capabilities

1.  **Design System Generation**: Analyzes project requirements to propose cohesive color palettes, typography, and spacing systems compatible with Tailwind CSS.
2.  **Component Implementation**: Generates production-ready React components using Tailwind CSS utility classes, Lucide icons, and best practices.
3.  **UX Pattern Advisory**: Suggests optimal user flows, feedback mechanisms (toasts, loading states), and micro-interactions.
4.  **Accessibility (a11y) Auditing**: Ensures designs meet WCAG AA standards (contrast, ARIA attributes, keyboard navigation).

## Usage Guidelines

### 1. Design System Generation
When the user asks for a "design system" or "style guide", generate a structured output based on the project context.

**Template:**
```markdown
+----------------------------------------------------------------------------------------+
|  TARGET: [Project Name/Type] - RECOMMENDED DESIGN SYSTEM                               |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  PATTERN: [Design Pattern Name] (e.g., Clean & Focus-Oriented)                         |
|     Core Value: [Key Value] (e.g., Distraction-free learning)                          |
|     Navigation: [Nav Strategy] (e.g., Bottom tab for mobile, Top bar for desktop)      |
|                                                                                        |
|  COLORS (Tailwind Map):                                                                |
|     Primary:    blue-600 (#2563EB) - Action buttons, Links                             |
|     Secondary:  slate-100 (#F1F5F9) - Backgrounds, Cards                               |
|     Accent:     amber-500 (#F59E0B) - Highlights, Favorites                            |
|     Text:       slate-900 (Main), slate-600 (Muted)                                    |
|                                                                                        |
|  TYPOGRAPHY:                                                                           |
|     Headings:   font-bold tracking-tight                                               |
|     Body:       leading-relaxed text-slate-600                                         |
|                                                                                        |
|  COMPONENTS:                                                                           |
|     Cards:      bg-white rounded-xl shadow-sm border border-slate-200                  |
|     Buttons:    rounded-full font-semibold transition-all hover:-translate-y-px        |
|                                                                                        |
|  PRE-DELIVERY CHECKLIST:                                                               |
|     [ ] Mobile First: Verified on 375px+                                               |
|     [ ] Dark Mode: Consistent colors defined                                           |
|     [ ] Accessibility: Contrast > 4.5:1, Aria-labels present                           |
|     [ ] States: Hover, Active, Focus, Disabled defined                                 |
+----------------------------------------------------------------------------------------+
```

### 2. Component Implementation Rules
-   **Tailwind First**: Use utility classes for everything. Avoid `style={{}}` unless dynamic.
-   **Responsive**: Always include mobile (`sm:`, `lg:`) breakpoints. Start with mobile styles as default.
-   **Interactive**: Add `hover:`, `active:`, `focus-visible:` states to all interactive elements.
-   **Feedback**: Include loading skeletons (`animate-pulse` or `animate-shimmer`) and empty states.
-   **Icons**: Use `lucide-react`.

### 3. Anti-Patterns to Avoid
-   Hardcoded hex values in components (use `tailwind.config.ts` or standard palette).
-   Inaccessible focus states (`outline-none` without replacement).
-   Over-complicated animations that distract from learning content.
-   Inconsistent spacing (stick to `gap-2`, `gap-4`, `p-4`, `p-6` etc.).

## Example Interaction

**User:** "Create a card for displaying a vocabulary word."

**Response:**
```tsx
import { Volume2, Star } from "lucide-react";

export function WordCard({ word, meaning, onPlay, onFavorite, isFavorite }) {
  return (
    <div className="group relative flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-slate-900">{word}</h3>
        <button 
          onClick={onFavorite}
          className="text-slate-400 hover:text-amber-400 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="text-slate-600">{meaning}</p>
      <div className="mt-2 pt-3 border-t border-slate-100 flex justify-end">
        <button 
          onClick={onPlay}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
        >
          <Volume2 size={16} />
          Listen
        </button>
      </div>
    </div>
  );
}
```
