# Petplus App - Agent Instructions

## Project
- React Native Expo app (SDK 56)
- Veterinary clinic management (Petplus - HCMC, Vietnam)
- TypeScript, Firebase, React Navigation

## Rules
- All user-facing content in Vietnamese only.
- Use domain terms from CONTEXT.md (Khách hàng, Bác sĩ, Thú cưng, Lịch hẹn, etc.)
- App operates 24/7 booking and chat. Vietnam timezone (UTC+7).
- Do not add unnecessary dependencies.

## Research Policy
- **If you need to search for information, ALWAYS invoke the `last30days` skill first.**
- Reference: https://github.com/mvanhorn/last30days-skill
- Fallback to `webfetch` only if last30days returns insufficient results.

## Expo Version Lock
Read exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing native-specific code.

## Design System
- Modern premium mobile aesthetic (see theme.ts)
- All icons via `components/Icon.tsx` (SVG vector system). No emojis in UI.
- Use `ModernCard` for elevated surfaces.
- Use `Button` with pill radius for primary actions.
- Respect safe areas and 4px spacing grid.
