# Plan 001: Demo Runtime And Data Contract

## Problem

The app now behaves like a single-account demo, but the data contract is still spread across `AuthContext`, AsyncStorage services, local constants, optional Firestore products, and the seed script. That makes the demo harder to reason about and increases the chance that one screen shows stale, missing, or differently shaped data.

## Goal

Make the single-account demo state predictable, resettable, and documented without replacing AsyncStorage or introducing login.

## Scope

- Keep AsyncStorage as the primary app-state store for pets, appointments, orders, and cart state.
- Keep Firestore products optional: use Firestore if seeded, otherwise use local `PRODUCTS`.
- Add one canonical demo user and one canonical demo state contract used consistently by screens and services.
- Add an in-app or developer-accessible reset path so external testers can restore the demo after trying checkout, booking, and schedule edits.

## Implementation Steps

1. Define a single demo constants module for `demo_user`, default address, default branch, default pet IDs, and reset seed values.
2. Refactor mock services to import the demo constants instead of duplicating default IDs and fallback strings.
3. Add a `resetDemoData()` function that clears and reseeds AsyncStorage keys for pets, appointments, orders, and cart.
4. Wire reset into a low-risk place for demos, such as the account/profile screen behind a clear "Reset demo data" action.
5. Document the data sources in `OFFLINE_CONTEXT.md` or a project README section: auth, products, pets, appointments, orders, and hosting.

## Acceptance Criteria

- Fresh install opens directly as the demo customer.
- Reset restores the same pets, orders, and empty or planned appointment state every time.
- Product loading works with no Firestore data.
- Product loading still works when Firestore has seeded products.
- No screen depends on real login to complete the main demo journeys.

## Verification

- Run `cd PetplusApp && npm run build`.
- Open the web app locally or live, reset demo data, then verify Home, My Pet, Schedule, Shop, Cart, Order History, and Chat still load.
- Disable or empty Firestore products during local testing if possible and confirm local product fallback still works.
