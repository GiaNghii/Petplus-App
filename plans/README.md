# Petplus Demo Improvement Plans

## Current State

- Local `main` is fast-forwarded to `origin/main` at `5690f9b chore: full update all screens, components, and services`.
- Working tree is clean except for the existing untracked `OFFLINE_CONTEXT.md`.
- The latest commit is broad: Firebase hosting config, Firestore/storage rules, seed script, local product assets, auto-login demo user, shop tab, product detail, order confirmation, quick-chat, pet detail, schedule edits, and UI component updates.
- The app is served as an Expo web export through Firebase Hosting. `npm run build` exports `PetplusApp/dist`, and `PetplusApp/firebase.json` serves that folder with SPA rewrites.
- Live URL remains `https://petplus-af32a.web.app/` when the latest `dist` is deployed to Firebase Hosting.

## Data Model Snapshot

- Auth is demo-first: `AuthContext` initializes a `demo_user` customer without requiring login.
- Pets, appointments, orders, and cart-like demo state are mostly served through AsyncStorage-backed mock services.
- Products are hybrid: `productService.getProducts()` tries Firestore `products` first, then falls back to local `PRODUCTS`.
- Firestore is currently useful for optional seeded products, not required for the core single-account demo.
- Existing seed data includes demo pets and orders; appointments start empty, then are created locally during booking.

## Discarded Older Findings

- Do not plan auto-login as a top-five item; it is already implemented.
- Do not plan a web build script as a top-five item; `npm run build` now exists.
- Do not plan local product image migration; product assets are now bundled.
- Do not prioritize multi-account data isolation; this is explicitly a single-account demo.

## Revised Top Five

1. [Demo Runtime And Data Contract](001-demo-runtime-and-data-contract.md)
2. [Home And Navigation Demo UI](002-home-and-navigation-demo-ui.md)
3. [Shop Cart And Order Flow](003-shop-cart-and-order-flow.md)
4. [Booking And Schedule Flow](004-booking-and-schedule-flow.md)
5. [Quick Chat And Prescription Flow](005-quick-chat-and-prescription-flow.md)

## Recommended Order

Start with Plan 001 because every other flow depends on consistent demo state and reset behavior. Then implement Plan 002 to make the demo easier to navigate, followed by the three task journeys: shopping, booking, and consultation.
