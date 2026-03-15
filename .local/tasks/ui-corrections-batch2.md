# UI & Logic Corrections — Batch 2

## What & Why
Apply 7 specific corrections that were either missed or not fully implemented in a previous iteration.

## Done looks like
- Global horizontal padding is 84px on desktop (container-custom and navbar both use `lg:px-[84px]`)
- A newly placed order shows status "Verified" in the Orders page immediately after checkout
- The "View All" button sits noticeably closer to the product cards below it
- The four flavor tiles on the Home page have tighter horizontal spacing between them
- The hero fruit-splash background image is centered directly under the bottle (fgImg), not shifted right
- Clicking "Sign In" once logs the user in and immediately redirects to the Account page — no double-click required
- The Sign Up page uses the same left-panel width (`md:w-[420px]`) and visual structure as the Login page

## Out of scope
- Any other spacing, color, font, or layout changes not listed above
- Login page itself (must remain unchanged)
- SMTP / email functionality
- Odoo integration changes

## Tasks
1. **Global padding** — Change `lg:px-[72px]` to `lg:px-[84px]` in the `.container-custom` utility in `index.css`. Apply the same `lg:px-[84px]` to the Navbar container if it uses a different inline padding value.

2. **Order status "Verified"** — The backend already sets `status: "Verified"` when creating an order, but the `insertOrderSchema` (via `createInsertSchema`) may be stripping or overriding the field before it reaches `storage.createOrder`. Verify the schema allows `status` to be passed, and that it is stored and returned as "Verified". Fix wherever the value is lost.

3. **View All button proximity** — Reduce the top margin on the "View All" button wrapper in the Featured/Products section of Home so it sits closer to the product card row.

4. **Flavor tile grid gap** — Add a controlled `gap-x` (e.g. `gap-x-2` or `gap-x-4`) to the flavor tiles grid on Home, and/or reduce `max-w` on each tile, so cards appear tighter horizontally.

5. **Hero fruit background centering** — Change the `bgImg` positioning in the hero right column from `right: 0, bottom: 0` to use `left: 50%, transform: translateX(-50%), bottom: 0` (or equivalent Tailwind absolute-center approach) so it is horizontally centered under the bottle image.

6. **Login one-click fix** — After `await login()` resolves, set the auth query data immediately in the cache using `queryClient.setQueryData` with the returned user object before calling `setLocation("/account")`. This prevents the Account page from seeing a stale null-user cache and avoids the need for multiple clicks.

7. **Sign Up page left panel** — Update the Signup page's left panel to match the Login page exactly: use `md:w-[420px]`, `minHeight: 520`, same font sizes (`text-[28px]`, `text-[15px]`), and the same `p-8` / `mt-auto` structure.

## Relevant files
- `client/src/index.css:237`
- `client/src/components/Navbar.tsx`
- `client/src/pages/Home.tsx:563,651`
- `client/src/pages/Home.tsx:424-440`
- `client/src/pages/Login.tsx`
- `client/src/pages/Signup.tsx`
- `client/src/hooks/use-auth.ts:18-36`
- `server/routes.ts:176-215`
- `shared/schema.ts:87`
