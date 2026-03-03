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

### Design System (Exact Specs)

**Colors:**
- Primary: `#0F3D91` (navy) — hover: `#0c3175`
- Secondary: `#2FA9C6` (teal)
- Promo/accent: `#F4B740` (amber)
- Destructive: `hsl(0 72% 51%)` — `#DC2626`
- Neutrals: 50 `#F8FAFC`, 200 `#E2E8F0`, 500 `#64748B`, 700 `#334155`, 950 `#0F172A`

**Typography:**
- Fonts: Sora (headings/brand), Inter (body), Cairo + Tajawal (Arabic)
- Scale utility classes: `text-h1` (48/56), `text-h2` (40/48), `text-h3` (32/40), `text-h4` (24/32), `text-body` (18/32), `text-small` (14/22), `text-label` (13/18 semibold)
- Responsive breakpoints scale down on tablet/mobile

**Border Radii:**
- `rounded-md` = 14px (buttons, inputs)
- `rounded-lg` = 20px (cards)
- `rounded-section` = 28px (sections)
- `rounded-modal` = 32px (modals)
- `rounded-pill` = 999px (pills, badges)

**Layout:**
- Container: `container-custom` (max-w-1200px with responsive padding)
- Section spacing: `section-spacing` (py-10 md:py-12 lg:py-16)
- Card hover: `card-hover-shadow`
- Modal shadow: `modal-shadow`

**Key frontend files:**
- `client/src/App.tsx` — Router, Navbar/Footer conditional (hidden on /login, /signup)
- `client/src/index.css` — Design tokens, typography scale, utility classes
- `tailwind.config.ts` — Extended theme with brand colors, fonts, radii
- `client/src/store/use-cart.ts` — Zustand cart store
- `client/src/hooks/use-auth.ts` — Auth queries/mutations
- `client/src/hooks/use-products.ts` — Product queries
- `client/src/hooks/use-orders.ts` — Order queries/mutations
- `client/src/hooks/use-addresses.ts` — Address queries/mutations
- `client/src/components/Navbar.tsx` — Fixed top nav with cart badge
- `client/src/components/Footer.tsx` — Site footer
- `client/src/components/ProductCard.tsx` — Reusable product card
- `client/src/pages/StaticPages.tsx` — About + Contact pages

### Backend Architecture

- **Runtime:** Node.js with Express 5
- **Language:** TypeScript (ESM modules)
- **Entry point:** `server/index.ts`
- **Routes:** `server/routes.ts`
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
### UI: shadcn/ui, Radix UI, Lucide React
### State: TanStack React Query v5, Zustand
### Forms: React Hook Form, Zod, drizzle-zod
### Styling: TailwindCSS, CVA, clsx, tailwind-merge, Google Fonts (Sora, Inter, Cairo, Tajawal)
### Dev: Vite, esbuild, tsx

### Future / Planned
- **Odoo ERP** — Backend for products, stock, customers, orders
- **Stripe** — Payment processing
- **Nodemailer** — Email notifications
