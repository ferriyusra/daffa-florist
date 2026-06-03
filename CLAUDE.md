# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build (Turbopack)
npm run start            # Start production server
npm run lint             # Run ESLint

npm run prisma:generate  # Regenerate Prisma client into src/generated/prisma
npm run prisma:migrate   # Create + apply a dev migration
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Run prisma/seed.ts via tsx (referenced but not yet present)
```

No test runner is configured. `postinstall` runs `prisma generate`. A `DATABASE_URL` (Postgres) is required for anything that touches the DB or imports [src/env.ts](src/env.ts), which validates env at boot with `@t3-oss/env-nextjs` + zod.

## Stack

- **Next.js 16** App Router (Turbopack), **React 19**, **TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/postcss` ([postcss.config.mjs](postcss.config.mjs))
- **framer-motion** for animations, **lucide-react** for icons
- Backend (T3-style): **tRPC v11** + **TanStack Query v5** + **superjson**, **Prisma 7** on **Postgres** (via the `@prisma/adapter-pg` driver adapter), **NextAuth v5 (beta)** with a Credentials provider, **zod** for validation, **bcryptjs** for password hashing.
- Site language is Indonesian (`<html lang="id">`); copy and SEO metadata are written in Bahasa Indonesia.

## Architecture

### Routes ([src/app/](src/app/))

App Router. Top-level routes: `/` (landing), `/products`, `/products/[slug]` (dynamic product detail), `/login`, `/register`, `/confirmation-order`, `/dashboard` (with nested `addresses/` and `orders/`). The root [layout.tsx](src/app/layout.tsx) defines extensive Indonesian-language SEO metadata (Open Graph, Twitter, geo tags for Ampar Putih, Pasaman Barat) — preserve this when editing.

Fonts are loaded via Google Fonts `@import` in [globals.css](src/app/globals.css) (`Inter` + `Playfair Display`), not via `next/font`. Theme tokens are defined as CSS custom properties on `:root` and exposed to Tailwind through `@theme inline`.

### Barrel exports

[src/components/](src/components/), [src/hooks/](src/hooks/), and [src/lib/](src/lib/) each have an `index.ts` that re-exports the directory's modules. Import from the directory (e.g. `import { Hero, Navbar } from '@/components'`), not the individual file. When adding a new module to one of these dirs, update the matching `index.ts`.

### tRPC + data layer ([src/server/](src/server/), [src/trpc/](src/trpc/))

The API is tRPC, organized T3-style. Server side lives in [src/server/api/](src/server/api/): [trpc.ts](src/server/api/trpc.ts) builds the context (`{ session, prisma, headers }`) and the procedure helpers, and [root.ts](src/server/api/root.ts) merges per-domain routers (`auth`, `product`, `order`) into `appRouter`. Add a new feature by creating a router in [src/server/api/routers/](src/server/api/routers/) and registering it in `root.ts`.

Three procedure tiers gate access — use the right one:
- `publicProcedure` — no auth.
- `protectedProcedure` — requires a session; throws `UNAUTHORIZED` otherwise, and narrows `ctx.session.user` to non-null.
- `adminProcedure` — `protectedProcedure` + requires `ctx.session.user.role === 'ADMIN'`; throws `FORBIDDEN`.

Two ways to call the API:
- **Client components**: import `api` from [src/trpc/react.tsx](src/trpc/react.tsx) (the `createTRPCReact` hooks, e.g. `api.product.list.useQuery()`). `RouterInputs` / `RouterOutputs` types are exported there too.
- **Server components / RSC**: import `api` from [src/trpc/server.ts](src/trpc/server.ts) — a direct server-side caller (no HTTP).

The HTTP route handler is [src/app/api/trpc/[trpc]/route.ts](src/app/api/trpc/%5Btrpc%5D/route.ts). The whole app is wrapped in `SessionProvider` + `TRPCReactProvider` via [src/app/providers.tsx](src/app/providers.tsx), mounted in [layout.tsx](src/app/layout.tsx). superjson is the transformer on both ends, so `Date`/`Decimal` round-trip correctly.

### Database (Prisma)

Schema: [prisma/schema.prisma](prisma/schema.prisma) — Postgres. Models: `User` (with `UserRole` CUSTOMER/ADMIN), `Address`, `Product` (+ child tables `ProductSize`/`ProductTemplate`/`ProductThemeColor`/`ProductAddon`), `Order` (with `OrderStatus`) and `OrderItem`. Order items denormalize product fields (`productSlug`, `productTitle`, …) so historical orders survive product edits/deletes (`onDelete: SetNull`).

The Prisma client is **generated into [src/generated/prisma/](src/generated/prisma/)** (not `node_modules`), so import it as `@/generated/prisma`. The singleton lives in [src/lib/prisma.ts](src/lib/prisma.ts) (global-cached in dev, uses the `pg` driver adapter). Config: [prisma.config.ts](prisma.config.ts). Run `npm run prisma:generate` after schema changes.

### Auth (NextAuth v5)

Config: [src/server/auth/config.ts](src/server/auth/config.ts) — a Credentials provider that verifies `email`+`password` against `User.hashedPassword` with bcrypt, JWT session strategy, sign-in page `/login`. `id` and `role` are threaded onto the JWT and session (the module augmentations for `Session`/`User`/`JWT` live in this file). [src/server/auth/index.ts](src/server/auth/index.ts) exports `{ handlers, auth, signIn, signOut }`; the route handler is [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/%5B...nextauth%5D/route.ts). Registration is a tRPC mutation (`auth.register`), not a NextAuth flow.

[use-auth.ts](src/hooks/use-auth.ts) is now a thin wrapper over `useSession()` (NextAuth) exposing `{ user, isLoading, logout }` — **not** localStorage. (Older docs described a localStorage `daffa_user`; that has been replaced.)

### Client-side cart state via localStorage + custom events

The cart is intentionally not held in React Context — it lives in `localStorage` and syncs across hook instances via a custom `window` event: [use-cart.ts](src/hooks/use-cart.ts) — `STORAGE_KEY = 'daffa_cart'`, event `'daffa-cart-change'`. Each mutator writes to `localStorage` and dispatches the event; every hook instance listens for both `storage` (cross-tab) and the custom event (same-tab) and rereads. When adding new persistent client state of this kind, follow the same shape. Such hooks are `'use client'` and guard against SSR with `typeof window === 'undefined'`. Cart helpers `parsePriceFromLabel` and `formatRupiah` (IDR) live alongside `useCart`.

### Product catalog

[src/lib/products.ts](src/lib/products.ts) is the current source of truth for products: `productCategories` (const tuple → `ProductCategory` union), and `Product` with sizes, templates, theme colors, and addons. The `product` tRPC router ([routers/product.ts](src/server/api/routers/product.ts)) serves this in-memory data (`list`/`getBySlug`/`related`/`categories`) — it does **not** yet read from the `Product` DB tables, even though the schema defines them. Orders, by contrast, are persisted to Postgres via the `order` router. Keep `src/lib/products.ts` as the catalog source until catalog data is migrated to the DB.

### Design system

[design-system/daffa-florist/MASTER.md](design-system/daffa-florist/MASTER.md) documents the visual system (colors, typography, spacing, shadows, component specs, anti-patterns). Note: the MASTER.md palette (blue/orange) describes the abstract spec; the **implemented** palette in [globals.css](src/app/globals.css) is warm blush + sage green + gold (`--primary: #9D174D`, `--secondary: #3D6B4F`, `--accent: #8B6914`). When styling, prefer the CSS custom properties from `globals.css` over hardcoded hex values, and follow the MASTER.md anti-patterns: no emoji icons (use lucide-react), `cursor-pointer` on clickables, 150–300ms transitions, no layout-shifting hover transforms.

### Code conventions

- Tab indentation (see existing files); single quotes; `'use client'` directive at the top of any client component.
- Path alias `@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).
