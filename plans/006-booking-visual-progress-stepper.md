# Plan 006: Add Visual Step-Progress Indicator to 4-Step Booking Flow

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5eb2386..HEAD -- PetplusApp/src/screens/customer/SelectBranchScreen.tsx PetplusApp/src/screens/customer/SelectDoctorScreen.tsx PetplusApp/src/screens/customer/SelectTimeSlotScreen.tsx PetplusApp/src/screens/customer/BookingConfirmationScreen.tsx PetplusApp/src/components/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction / UI
- **Planned at**: commit `5eb2386`, 2026-06-13

## Why this matters

The booking flow has 4 screens (Branch → Doctor → Time Slot → Confirmation). Each screen only shows "Bước X / 4" as plain text, with no visual indication of how far along the user is or how many steps remain. First-time users have no spatial sense of progress, which can cause early abandonment. A horizontal dot/segment progress bar is the standard pattern for multi-step forms on mobile and adds zero friction — users immediately understand "I'm 2 of 4 steps done."

## Current state

All 4 booking screens display step number as plain text only:

- `PetplusApp/src/screens/customer/SelectBranchScreen.tsx:64`
  ```tsx
  <Text style={styles.stepText}>Bước 1 / 4</Text>
  ```
- `PetplusApp/src/screens/customer/SelectDoctorScreen.tsx:20-22`
  ```tsx
  <Header title="Chọn bác sĩ" subtitle="Bước 2 / 4" onBack={...} />
  ```
  and inside the scroll:
  ```tsx
  <Text style={styles.stepText}>Bước 2 / 4</Text>
  ```
- `PetplusApp/src/screens/customer/SelectTimeSlotScreen.tsx`
  Uses Header subtitle "Bước 3 / 4" plus same text in scroll.
- `PetplusApp/src/screens/customer/BookingConfirmationScreen.tsx`
  Should show "Bước 4 / 4".

The `PetplusApp/src/components/` directory contains: `Button.tsx`, `Card.tsx`, `Header.tsx`, `Icon.tsx`, `Input.tsx`, `Logo.tsx`, `ModernCard.tsx`, `QuickChatPanel.tsx`, `WeightChart.tsx`. There is no step-progress component yet.

**Theme tokens to use** (from `PetplusApp/src/utils/theme.ts`):
- `theme.colors.primary` — active step fill (`#2E7D32`)
- `theme.colors.border` — inactive step fill (`#E0E0E0`)
- `theme.colors.textOnPrimary` — text on active step (white)
- `theme.radius.pill` — use for rounded segment ends

**Design convention**: New shared components live in `PetplusApp/src/components/`. All existing components in that directory use `StyleSheet.create` and import `theme` from `../../utils/theme`. Match this exactly.

## Commands you will need

| Purpose   | Command                                            | Expected on success       |
|-----------|----------------------------------------------------|---------------------------|
| Typecheck | `cd PetplusApp && npx tsc --noEmit`                | exit 0, no type errors    |
| Build     | `cd PetplusApp && npm run build`                   | exit 0, dist/ produced    |

## Scope

**In scope** (the only files you should modify):
- `PetplusApp/src/components/StepProgress.tsx` (create)
- `PetplusApp/src/screens/customer/SelectBranchScreen.tsx`
- `PetplusApp/src/screens/customer/SelectDoctorScreen.tsx`
- `PetplusApp/src/screens/customer/SelectTimeSlotScreen.tsx`
- `PetplusApp/src/screens/customer/BookingConfirmationScreen.tsx`

**Out of scope** (do NOT touch):
- `PetplusApp/src/components/Header.tsx` — do not add step logic there; the Header component is shared across non-booking screens
- Any non-booking screen
- The navigation structure in `AppNavigator.tsx`
- `plans/README.md` status for other plans

## Git workflow

- Branch: `advisor/006-booking-step-progress`
- Commit message style (match existing repo): `feat: add visual step progress to booking flow`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `StepProgress` component

Create `PetplusApp/src/components/StepProgress.tsx`:

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface StepProgressProps {
  current: number; // 1-based current step
  total: number;
}

export default function StepProgress({ current, total }: StepProgressProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < current ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.pill,
  },
  active: {
    backgroundColor: theme.colors.primary,
  },
  inactive: {
    backgroundColor: theme.colors.border,
  },
});
```

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 2: Add `StepProgress` to `SelectBranchScreen`

In `PetplusApp/src/screens/customer/SelectBranchScreen.tsx`:

1. Add import at the top:
   ```tsx
   import StepProgress from '../../components/StepProgress';
   ```
2. Find the `headerInfo` `View` block:
   ```tsx
   <View style={styles.headerInfo}>
     <Text style={styles.stepText}>Bước 1 / 4</Text>
     <Text style={styles.title}>Bạn muốn khám ở chi nhánh nào?</Text>
   ```
   Insert `<StepProgress current={1} total={4} />` after the `<Text style={styles.stepText}>` line.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 3: Add `StepProgress` to `SelectDoctorScreen`

Same pattern as Step 2. The screen already shows `<Text style={styles.stepText}>Bước 2 / 4</Text>` inside the scroll content. Insert `<StepProgress current={2} total={4} />` after that text line.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 4: Add `StepProgress` to `SelectTimeSlotScreen`

Same pattern. Find `<Text style={styles.stepText}>Bước 3 / 4</Text>` and insert `<StepProgress current={3} total={4} />` after it.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 5: Add `StepProgress` to `BookingConfirmationScreen`

Open `PetplusApp/src/screens/customer/BookingConfirmationScreen.tsx`. Find where "Bước 4 / 4" (or equivalent confirmation step text) is rendered and insert `<StepProgress current={4} total={4} />` after it. If the screen does not have a step text, add both:
```tsx
<Text style={styles.stepText}>Bước 4 / 4</Text>
<StepProgress current={4} total={4} />
```
using the same `stepText` style that exists in the other booking screens.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 6: Build

**Verify**: `cd PetplusApp && npm run build` → exits 0, `dist/` updated.

## Test plan

This is a UI-only change; no logic is modified. Visual verification:

- Open the app and start the booking flow. At each of the 4 screens, confirm that a horizontal bar with 4 segments is visible below the "Bước X / 4" text, with X segments filled in green and the rest gray.
- Confirm typecheck passes with `npx tsc --noEmit`.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] `PetplusApp/src/components/StepProgress.tsx` exists
- [ ] All 4 booking screens import and render `<StepProgress ...>` with the correct `current` value
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 006 updated to DONE

## STOP conditions

- The code at the locations in "Current state" doesn't match the excerpts (codebase drifted).
- `npx tsc --noEmit` fails after a fix attempt and the error is in a file outside the scope list.
- `BookingConfirmationScreen.tsx` does not have a visible step text or headerInfo section — stop and report the actual structure before adding `StepProgress`.

## Maintenance notes

- If the booking flow ever changes to 3 or 5 steps, update the `total={4}` prop on all instances.
- The `StepProgress` component is generic and can be reused for other multi-step flows (e.g., a future pet onboarding wizard).
- The `current` prop is 1-based (step 1 fills segment index 0) — confirm this matches visual expectations before shipping.
