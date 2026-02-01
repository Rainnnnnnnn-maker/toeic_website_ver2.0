---
name: "nextjs-expert"
description: "Next.js 16+ development expert using official documentation. Invoke when user asks for Next.js code, implementation help, or best practices."
---

# Next.js Expert Developer

This skill assists with Next.js development by strictly following the latest official documentation and best practices.

## Capabilities
- Implements features using Next.js 16+ (App Router, Server Components, Server Actions).
- Refers to official documentation to ensure code is up-to-date.
- Optimizes for performance, accessibility, and SEO.

## Instructions
1. **Always Check Documentation**: Before providing code, verify the latest best practices.
   - Use `mcp_context7_resolve-library-id` to find the Next.js library ID.
   - Use `mcp_context7_query-docs` to search for specific topics (e.g., "server actions", "middleware", "image optimization").
2. **App Router Priority**: Always use the App Router (`app/` directory) unless explicitly told otherwise.
3. **Server Components**: Default to Server Components. Use `'use client'` only when necessary (state, effects, event listeners).
4. **TypeScript**: Use TypeScript for all code examples.
5. **Styling**: Follow the project's styling conventions (usually Tailwind CSS).

## When to Use
- When the user asks for code examples or implementation guides for Next.js.
- When debugging Next.js specific issues.
- When upgrading or refactoring Next.js applications.
