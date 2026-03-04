# ALNOURS E-Commerce Platform

## Overview

ALNOURS is a B2C e-commerce website for a Saudi food trading and distribution company. The platform allows customers to browse and purchase products (primarily Domty premium drinks), manage their accounts, and place orders. The system is designed with a future Odoo ERP integration in mind — the current implementation uses a PostgreSQL database with mock/scaffold data that matches the expected Odoo data shape.

**Key pages:**
- Public: Home, Products, Product Detail, Brands, About, Contact
- Commerce: Cart
- Auth: Login, Signup (no navbar/footer)
- Account (protected): Overview, Orders, Addresses, Profile

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework:** React with Vite bundler
- **Routing:** Wouter (`wouter` package)
- **State Management:** Zustand with `persist` middleware for the shopping cart (localStorage key: `alnours-cart`)
- **Server State:** TanStack React Query v5 for all API calls
- **UI Components:** shadcn/ui (New York style) built on Radix UI primitives
- **Styling:** TailwindCSS with CSS variables for design tokens
- **i18n:** Custom LanguageContext with EN/AR JSON translation files; toggle switches `html[lang]` and `html[dir]`
- **Scroll Animations:** `<Reveal>` component wrapping sections with IntersectionObserver (fade + translateY, once)
- **SEO:** `<SEO>` component sets document title, meta description, OG tags, canonical, and alternates per page

### Design System (Exact Specs)

**Colors:**
- Primary: `#0F3D91` (navy) — hover: `#0c3175`
- Secondary: `#2FA9C6` (teal)
- Promo/accent: `#F4B740` (amber)
- Eyebrow/trust badge accent: `#248399`
- Destructive: `hsl(0 72% 51%)` — `#DC2626`
- Neutrals: 50 `#F8FAFC`, 200 `#E2E8F0`, 500 `#64748B`, 700 `#334155`, 950 `#0F172A`

**Typography:**
- Fonts: Sora (headings/brand), Inter (body), Cairo + Tajawal (Arabic — auto-switch via `[dir="rtl"]`)
- Scale utility classes: `text-h1` (48/56), `text-h2` (40/48), `text-h3` (32/40), `text-h4` (24/32), `text-body` (18/32), `text-small` (14/22), `text-label` (13/18 semibold)
- Responsive breakpoints scale down on tablet/mobile

**Border Radii:**
- `rounded-md` = 14px (inputs)
- `rounded-lg` = 20px (cards)
- `rounded-section` = 28px (sections)
- `rounded-modal` = 32px (modals)
- `rounded-pill` = 999px (ALL buttons, badges, pills)

**Button Styling (global):**
- All `<Button>` components use `rounded-pill` (999px) via `ui/button.tsx` base class
- `btn-styled` class applied globally: bottom/right stroke (rgba(0,0,0,0.18)), subtle shadow (2px 2px 2px rgba(0,0,0,0.25))
- `link` variant overrides shadow/radius to none

**Layout:**
- Container: `container-custom` (max-w-1200px with responsive padding)
- Section spacing: `section-spacing` (py-10 md:py-12 lg:py-16)
- Card hover: `card-hover-shadow`
- Modal shadow: `modal-shadow`
- Scrollbar hide: `scrollbar-hide`

**Key frontend files:**
- `client/src/App.tsx` — Router, LanguageProvider, Navbar/Footer conditional (hidden on /login, /signup)
- `client/src/index.css` — Design tokens, typography scale, utility classes, btn-styled, featured-gradient-bg
- `tailwind.config.ts` — Extended theme with brand colors, fonts, radii
- `client/src/contexts/LanguageContext.tsx` — i18n context (EN/AR toggle, RTL/LTR, localStorage persistence)
- `client/src/i18n/en.json` — English translations (all pages + SEO metadata)
- `client/src/i18n/ar.json` — Arabic translations (currently duplicates English, structure ready)
- `client/src/components/Reveal.tsx` — IntersectionObserver scroll animation wrapper
- `client/src/components/SEO.tsx` — Document head metadata setter
- `client/src/store/use-cart.ts` — Zustand cart store
- `client/src/hooks/use-auth.ts` — Auth queries/mutations
- `client/src/hooks/use-products.ts` — Product queries
- `client/src/hooks/use-orders.ts` — Order queries/mutations
- `client/src/hooks/use-addresses.ts` — Address queries/mutations
- `client/src/components/Navbar.tsx` — Fixed top nav: auth/guest behavior, social icons, language toggle, cart badge
- `client/src/components/Footer.tsx` — Light 4-column top + dark centered bottom bar with social icons
- `client/src/components/AddButton.tsx` — Reusable add-to-cart button with plus→check morph animation (compact/full variants)
- `client/src/components/ProductCard.tsx` — Unified product card with variant prop: "featured" (251×216 compact), "grid" (responsive large), "related" (280×230). Packshot overflows right edge, fruit splash behind, 2-line meta.
- `client/src/pages/StaticPages.tsx` — About (full-bleed blue block section 2, gradient + icon cards section 3) + Contact pages
- `client/src/pages/Home.tsx` — Hero (2 images, trust badges), Featured Products (gradient + seamless infinite auto-scroll carousel), Shop by Flavor, How it works
- `client/src/pages/ProductDetail.tsx` — Blue gradient hero bg, layered drink+fruit images, "You might like" related products section
- `client/src/pages/Brands.tsx` — "Domty at a glance" cards: bg #EDF2FD, rounded 20px, hover shadow

### Header Behavior
- **Guest (not signed in):** Social icons (Instagram, Facebook, LinkedIn) + Cart icon + "Sign in" button + Language toggle
- **Signed in:** Cart icon + Account icon + Language toggle (no social icons, no sign in)

### Backend Architecture

- **Runtime:** Node.js with Express 5
- **Language:** TypeScript (ESM modules)
- **Entry point:** `server/index.ts`
- **Routes:** `server/routes.ts` (with retry-based seedDatabase — won't crash on transient DB failures)
- **Storage layer:** `server/storage.ts` — `DatabaseStorage` class implementing `IStorage` interface
- **API contract:** `shared/routes.ts` — Zod schemas shared between client/server
- **Dev server:** Vite middleware through Express

**Auth approach:** Simple in-memory `mockLoggedInUserId` variable (demo only). Passwords stored in plaintext — must be hashed before production.

**API shape (all under `/api/`):**
- `POST /api/auth/login` | `POST /api/auth/signup` | `GET /api/auth/me` | `POST /api/auth/logout`
- `GET /api/products` | `GET /api/products/:slug`
- `GET /api/orders` | `POST /api/orders`
- `GET /api/addresses` | `POST /api/addresses`

**Seed data:** 4 Domty products (Cocktail, Mango, Guava, Orange) at 30 SAR each, sizes 235 ml / 1000 ml

### Data Storage

- **Database:** PostgreSQL via Drizzle ORM
- **Schema:** `shared/schema.ts`
- **Tables:** users, addresses, products, orders
- **Push:** `npm run db:push`

### Build System

- **Client:** Vite → `dist/public/`
- **Server:** esbuild → `dist/index.cjs`
- **Dev:** `tsx server/index.ts` with Vite middleware

### Path Aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## External Dependencies

### Core: PostgreSQL, Drizzle ORM, Express 5
### UI: shadcn/ui, Radix UI, Lucide React, react-icons (social icons)
### State: TanStack React Query v5, Zustand
### Forms: React Hook Form, Zod, drizzle-zod
### Styling: TailwindCSS, CVA, clsx, tailwind-merge, Google Fonts (Sora, Inter, Cairo, Tajawal)
### Dev: Vite, esbuild, tsx

### Future / Planned
- **Odoo ERP** — Backend for products, stock, customers, orders
- **Stripe** — Payment processing
- **Nodemailer** — Email notifications
- **Route-based locale** (`/en/...`, `/ar/...`) — Currently context-based; route prefix planned
