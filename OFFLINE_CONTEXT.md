# Petplus Offline Context

This file is the local handoff for the Petplus app in this workspace.

## Where the app lives

- Root repo: `/Users/thinh/Documents/Developer/Projects/Petplus`
- Main app: `/Users/thinh/Documents/Developer/Projects/Petplus/PetplusApp`
- Product docs: `CONTEXT.md`, `PRD.md`
- App guidance: `PetplusApp/README.md`, `PetplusApp/AGENTS.md`, `PetplusApp/CLAUDE.md`

## What this project is

- Petplus is a Vietnamese pet-care mobile app for customers and doctors.
- The app covers pet profiles, appointments, chat consultations, shop/orders, reminders, and role-based navigation.
- User-facing language is Vietnamese.
- The business rules come from the root `CONTEXT.md` and `PRD.md`.

## Current technical shape

- Stack: React Native + Expo SDK 56, TypeScript, Firebase packages, AsyncStorage.
- Entry points: `PetplusApp/index.ts` -> `PetplusApp/App.tsx` -> `PetplusApp/src/navigation/AppNavigator.tsx`.
- Auth is single-account demo-first. `AuthContext` starts as `demo_user` from `PetplusApp/src/data/demoData.ts`; no login is required for the customer demo.
- Demo constants live in `PetplusApp/src/data/demoData.ts`: user, default address, pets, seed orders, and empty appointment seed.
- `PetplusApp/src/services/mockDataService.ts` stores pets, appointments, and orders in AsyncStorage and exposes `resetDemoData()`.
- Products are hybrid: `PetplusApp/src/services/firestoreService.ts` tries Firestore `products`, then falls back to bundled `PetplusApp/src/data/products.ts`.
- Firebase is configured for hosting and optional data seeding. The web app builds into `PetplusApp/dist` and Firebase Hosting serves that folder.
- `PetplusApp/src/utils/testConnection.ts` and `PetplusApp/src/screens/TestConnectionScreen.tsx` are present for Firebase connectivity checks.

## Navigation snapshot

- Customer flow uses bottom tabs for Home, Pet, Lịch, Tư vấn, Shop, and Demo.
- Doctor flow has its own stack with DoctorHome, DoctorChatList, and DoctorChat.
- Anonymous screens still exist, but the demo runtime keeps the customer signed in as `demo_user`.

## Demo data reset

- Use the Demo tab -> `Reset demo data` to restore seed pets and orders, clear appointments, and clear the cart.
- This is intended for external testers using the hosted demo, especially after checkout, booking, and schedule edits.
- Reset does not require Firebase and works offline through AsyncStorage.

## Domain rules to keep in mind

- 3 branches: Go Vap, District 11, District 12.
- Appointment slots are 2 hours, max 3 patients per doctor per slot, and booking must happen at least 2 hours ahead.
- Consultation supports real-time chat and product-link prescriptions.
- Orders support Momo, bank transfer, and COD.
- Delivery is limited to Ho Chi Minh City and fulfilled from the nearest branch with stock.

## Collaboration workflow for you and your sister

- Work from this local clone and keep all changes in Git branches.
- Use one branch per feature or fix, then merge via PR after review.
- Keep product decisions in `CONTEXT.md` and implementation notes in feature branches or PR descriptions.
- If you split work, one person should own UI/screens while the other owns data/services/navigation to reduce merge conflicts.
- Before changing anything, read `PetplusApp/README.md`, `PetplusApp/AGENTS.md`, and `PetplusApp/CLAUDE.md` so both of you follow the same Expo 56 guidance.

## Useful local commands

- `cd /Users/thinh/Documents/Developer/Projects/Petplus/PetplusApp`
- `npm install`
- `npm run web`
- `npm run build`
- `npm run ios`
- `npm run android`

## Installed agent skill

- `improve` is installed and visible to Codex, Claude Code, and OpenCode on this machine.
- Shared install path: `~/.agents/skills/improve`
- Host-visible links:
- `~/.codex/skills/improve`
- `~/.claude/skills/improve`
- `~/.config/opencode/skills/improve`
