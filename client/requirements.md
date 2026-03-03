## Packages
zustand | Global state management for shopping cart
framer-motion | Smooth page transitions and micro-interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging tailwind classes without style conflicts

## Notes
- Wouter is used for routing (no nested `<a>` inside `<Link>`).
- Zustand is used for the shopping cart to persist items across page reloads.
- Authentication relies on `/api/auth/me` to determine user state.
- Unsplash images are used as placeholders where dynamic product images are unavailable.
