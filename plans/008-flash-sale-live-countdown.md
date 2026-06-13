# Plan 008: Replace Static Flash Sale Timer with a Live Countdown

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5eb2386..HEAD -- PetplusApp/src/screens/customer/HomeScreen.tsx`
> If the file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as
> a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction / UI
- **Planned at**: commit `5eb2386`, 2026-06-13

## Why this matters

The Flash Sale section on the Home screen displays a hard-coded string "Kết thúc sau: 02:15:30". The timer never changes — it shows the same value every time the app is opened and does not tick down. In demo presentations, static timers look broken and undermine the overall polish of the app. A real countdown that ticks every second creates urgency and makes the home screen feel live, at the cost of roughly 10 lines of code.

## Current state

`PetplusApp/src/screens/customer/HomeScreen.tsx`:

**Static timer string** (search for `flashTimer` style usage):
```tsx
<Text style={styles.flashTimer}>Kết thúc sau: 02:15:30</Text>
```
This is a plain `Text` element with no state behind it.

**Relevant imports already present** in the file:
```tsx
import React, { useState, useMemo, useCallback } from 'react';
```
`useEffect` is not yet imported. It must be added.

**Convention**: The file already uses the `useState` + `useEffect` hook pattern (see `useFocusEffect` wrapping `loadAll`). Match that style.

## Commands you will need

| Purpose   | Command                                            | Expected on success    |
|-----------|----------------------------------------------------|------------------------|
| Typecheck | `cd PetplusApp && npx tsc --noEmit`                | exit 0, no type errors |
| Build     | `cd PetplusApp && npm run build`                   | exit 0                 |

## Scope

**In scope** (the only file you should modify):
- `PetplusApp/src/screens/customer/HomeScreen.tsx`

**Out of scope** (do NOT touch):
- Any product or pricing data
- Shop screen or any other screen
- Flash Sale product list logic (the `flashProducts` memo)

## Git workflow

- Branch: `advisor/008-flash-sale-countdown`
- Commit message: `feat: live countdown timer on Flash Sale section`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add `useEffect` to the React import

The current import line is:
```tsx
import React, { useState, useMemo, useCallback } from 'react';
```
Change it to:
```tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
```

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 2: Add countdown state and effect

Inside the `HomeScreen` component function, after the existing state declarations (after `upcomingAppointment` state), add:

```tsx
// Flash Sale countdown: ticks every second, resets to 2h each mount
const [flashSeconds, setFlashSeconds] = useState(2 * 60 * 60); // 2 hours

useEffect(() => {
  const id = setInterval(() => {
    setFlashSeconds(prev => (prev > 0 ? prev - 1 : 0));
  }, 1000);
  return () => clearInterval(id);
}, []);

const flashTimeDisplay = (() => {
  const h = Math.floor(flashSeconds / 3600);
  const m = Math.floor((flashSeconds % 3600) / 60);
  const s = flashSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
})();
```

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 3: Replace the static timer string in JSX

Find:
```tsx
<Text style={styles.flashTimer}>Kết thúc sau: 02:15:30</Text>
```
Replace with:
```tsx
<Text style={styles.flashTimer}>Kết thúc sau: {flashTimeDisplay}</Text>
```

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 4: Build

**Verify**: `cd PetplusApp && npm run build` → exits 0.

## Test plan

Manual verification:

- Open the Home screen. The Flash Sale timer should show "Kết thúc sau: 02:00:00" (or slightly less if a second has elapsed).
- Wait 3 seconds. The seconds field should have ticked down by 3 (e.g., "01:59:57").
- Navigate away from Home and return. The timer should continue from where it left off (it does not reset on tab focus, only on full component remount).

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] Flash Sale timer visibly counts down at 1-second intervals
- [ ] The static string "02:15:30" no longer appears anywhere in the JSX
- [ ] `useEffect` cleanup (`clearInterval`) is present to prevent memory leaks
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 008 updated to DONE

## STOP conditions

- `HomeScreen.tsx` does not contain the static timer string — confirm the text "02:15:30" exists with `grep` before editing.
- TypeScript errors after Step 2 unrelated to the added code (the file has pre-existing errors that block typecheck).

## Maintenance notes

- The countdown starts at 2 hours and resets to 2 hours on each app mount. It is purely presentational — no real sale end date is backed by the data. If a real sale deadline is added later (e.g., from Firestore), replace the initial `flashSeconds` value with `Math.max(0, Math.floor((saleEndDate - Date.now()) / 1000))`.
- When `flashSeconds` reaches 0, the display shows "00:00:00" and stops. Add a "Sale đã kết thúc" state if that edge case becomes visible in demos.
- The `clearInterval` in the effect return prevents a memory leak when the HomeScreen unmounts (e.g., user logs out).
