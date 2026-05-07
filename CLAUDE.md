# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/postcss` ([postcss.config.mjs](postcss.config.mjs))
- **framer-motion** for animations, **lucide-react** for icons
- Site language is Indonesian (`<html lang="id">`); copy and SEO metadata are written in Bahasa Indonesia.

## Architecture

### Routes ([src/app/](src/app/))

App Router. Top-level routes: `/` (landing), `/products`, `/products/[slug]` (dynamic product detail), `/login`, `/register`, `/confirmation-order`, `/dashboard` (with nested `addresses/` and `orders/`). The root [layout.tsx](src/app/layout.tsx) defines extensive Indonesian-language SEO metadata (Open Graph, Twitter, geo tags for Ampar Putih, Pasaman Barat) — preserve this when editing.

Fonts are loaded via Google Fonts `@import` in [globals.css](src/app/globals.css) (`Inter` + `Playfair Display`), not via `next/font`. Theme tokens are defined as CSS custom properties on `:root` and exposed to Tailwind through `@theme inline`.

### Barrel exports

[src/components/](src/components/), [src/hooks/](src/hooks/), and [src/lib/](src/lib/) each have an `index.ts` that re-exports the directory's modules. Import from the directory (e.g. `import { Hero, Navbar } from '@/components'`), not the individual file. When adding a new module to one of these dirs, update the matching `index.ts`.

### Client-side state via localStorage + custom events

Persistent client state is intentionally not held in React Context — it lives in `localStorage` and syncs across hook instances via a custom `window` event. Two hooks follow this pattern:

- [use-cart.ts](src/hooks/use-cart.ts) — `STORAGE_KEY = 'daffa_cart'`, event `'daffa-cart-change'`
- [use-auth.ts](src/hooks/use-auth.ts) — `STORAGE_KEY = 'daffa_user'`, event `'daffa-auth-change'`

Each mutator writes to `localStorage` and dispatches the custom event; every hook instance listens for both `storage` (cross-tab) and the custom event (same-tab) and rereads. When adding new persistent client state, follow the same shape so all consumers stay in sync. All such hooks are `'use client'` and guard against SSR with `typeof window === 'undefined'`.

Cart helpers `parsePriceFromLabel` and `formatRupiah` (IDR) live alongside `useCart`.

### Product catalog

[src/lib/products.ts](src/lib/products.ts) is the single source of truth for products: `productCategories` (const tuple → `ProductCategory` union), and `Product` with sizes, templates, theme colors, and addons. The `/products` page filters by category and `/products/[slug]` reads by slug — both consume this file directly (no API/DB).

### Design system

[design-system/daffa-florist/MASTER.md](design-system/daffa-florist/MASTER.md) documents the visual system (colors, typography, spacing, shadows, component specs, anti-patterns). Note: the MASTER.md palette (blue/orange) describes the abstract spec; the **implemented** palette in [globals.css](src/app/globals.css) is warm blush + sage green + gold (`--primary: #9D174D`, `--secondary: #3D6B4F`, `--accent: #8B6914`). When styling, prefer the CSS custom properties from `globals.css` over hardcoded hex values, and follow the MASTER.md anti-patterns: no emoji icons (use lucide-react), `cursor-pointer` on clickables, 150–300ms transitions, no layout-shifting hover transforms.

### Code conventions

- Tab indentation (see existing files); single quotes; `'use client'` directive at the top of any client component.
- Path alias `@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).
