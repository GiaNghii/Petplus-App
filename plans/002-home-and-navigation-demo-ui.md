# Plan 002: Home And Navigation Demo UI

## Problem

The latest Home screen is much stronger, but the demo UI now has many entry points: six bottom tabs, quick actions, product promos, upcoming appointments, pet selector, shop, chat, schedule, and account. For a demo app, the first screen should guide the tester through the intended story instead of feeling like a partially complete production app.

## Goal

Make the UI feel intentional and demo-first: clear hero context, obvious next actions, fewer dead ends, and a stronger visual hierarchy across the core journeys.

## Scope

- Keep the current customer-only app structure.
- Improve the Home screen as the main demo dashboard.
- Revisit the six-tab bottom navigation so it works on small screens and does not compete with primary actions.
- Keep existing screens; do not remove major features unless they are redundant for the single-account demo.

## Implementation Steps

1. Redesign Home around three demo journeys: "Book a visit", "Ask a vet", and "Shop treatment".
2. Add clearer demo state cards: current pet, next appointment, recent order, and active recommendation.
3. Make empty states actionable and specific, especially when no appointment exists.
4. Audit bottom tabs on mobile widths and either simplify labels/icons or move lower-priority surfaces behind Account/Home shortcuts.
5. Standardize card spacing, button weight, icon treatment, and section headings so Home, Shop, Schedule, and Pet Detail feel like the same product.

## Acceptance Criteria

- A first-time tester understands the three demo journeys within five seconds of landing on Home.
- Every Home CTA navigates to a working flow with the current demo pet selected.
- Bottom tabs do not wrap, crowd, or visually collapse on common mobile widths.
- Empty states explain what to do next instead of only saying there is no data.
- UI polish does not break the web build.

## Verification

- Run `cd PetplusApp && npm run build`.
- Manually test Home at desktop width and mobile web width.
- Use the live Firebase URL after deployment to confirm external devices see the same navigation and layout.
