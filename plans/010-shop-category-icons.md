# Plan 010: Give Each Shop Category Filter Chip a Distinct Icon

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5eb2386..HEAD -- PetplusApp/src/screens/customer/ShopScreen.tsx PetplusApp/src/data/products.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: UI / scanability
- **Planned at**: commit `5eb2386`, 2026-06-13

## Why this matters

The Shop screen shows 5 category filter chips (Tất cả, Thuốc, Thức ăn, Phụ kiện, Spa). Every single chip uses `<Icon name="medkit" ...>` regardless of the category — all chips look identical. Users have to read the text label to tell them apart, which defeats the purpose of using icons at all. Each category already has an `emoji` field in `CATEGORIES` (`🛍️`, `💊`, `🍖`, `🪮`, `🛁`), but the ShopScreen ignores it and hard-codes `"medkit"`. The fix is to add an `icon` field to `CATEGORIES` and use it in the chip render. The existing `Icon` component supports Ionicons names — map each category to the most fitting one.

## Current state

**`PetplusApp/src/data/products.ts`** — CATEGORIES array (lines 420–426):
```tsx
export const CATEGORIES = [
  { id: 'all',     name: 'Tất cả', emoji: '🛍️' },
  { id: 'thuoc',   name: 'Thuốc',  emoji: '💊' },
  { id: 'thucan',  name: 'Thức ăn', emoji: '🍖' },
  { id: 'phukien', name: 'Phụ kiện', emoji: '🪮' },
  { id: 'spa',     name: 'Spa',    emoji: '🛁' },
];
```
No `icon` field exists yet.

**`PetplusApp/src/screens/customer/ShopScreen.tsx`** — category chip render (inside the `ScrollView`):
```tsx
{CATEGORIES.map((cat) => (
  <TouchableOpacity
    key={cat.id}
    style={[
      styles.catChip,
      activeCategory === cat.id && styles.catChipActive,
    ]}
    onPress={() => setActiveCategory(cat.id)}
  >
    <Icon name="medkit" size={14} color={activeCategory === cat.id ? theme.colors.textOnPrimary : theme.colors.textSecondary} />
    <Text style={[
      styles.catText,
      activeCategory === cat.id && styles.catTextActive,
    ]}>
      {cat.name}
    </Text>
  </TouchableOpacity>
))}
```
`<Icon name="medkit" ...>` is hard-coded — the `cat` data is not used for the icon.

**Available Ionicons names** in the project (used across the codebase): `"cart"`, `"paw"`, `"medkit"`, `"star"`, `"search"`, `"calendar"`, `"chatbubbles"`, `"water"`, `"leaf"`, `"sparkles"`, `"home"`, `"grid"`, `"restaurant"`. The `Icon` component wraps Ionicons from `@expo/vector-icons`.

**Suggested icon mapping**:
| Category id | Icon name        | Rationale            |
|-------------|-----------------|----------------------|
| `all`       | `"grid"`         | grid = all items     |
| `thuoc`     | `"medkit"`       | existing, correct    |
| `thucan`    | `"restaurant"`   | food/eating          |
| `phukien`   | `"paw"`          | accessories for pets |
| `spa`       | `"sparkles"`     | grooming/spa         |

If `"restaurant"` or `"sparkles"` are not available in the installed version, acceptable fallbacks are `"nutrition"` for `thucan` and `"water"` for `spa`. Run `grep -rn '"restaurant"\|"sparkles"\|"nutrition"' PetplusApp/src/` to check if they are already used (presence in the codebase confirms they work).

## Commands you will need

| Purpose      | Command                                              | Expected on success    |
|--------------|------------------------------------------------------|------------------------|
| Check icons  | `grep -rn '"restaurant"\|"sparkles"' PetplusApp/src/` | presence = available  |
| Typecheck    | `cd PetplusApp && npx tsc --noEmit`                  | exit 0, no type errors |
| Build        | `cd PetplusApp && npm run build`                     | exit 0                 |

## Scope

**In scope** (the only files you should modify):
- `PetplusApp/src/data/products.ts` — add `icon` field to `CATEGORIES`
- `PetplusApp/src/screens/customer/ShopScreen.tsx` — use `cat.icon` in chip render

**Out of scope** (do NOT touch):
- `Icon.tsx` component itself
- Category filter logic / `activeCategory` state
- Product data (`PRODUCTS` array)
- Any other screen

## Git workflow

- Branch: `advisor/010-shop-category-icons`
- Commit message: `feat: distinct icons for shop category chips`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Check icon availability

Run:
```
grep -rn '"restaurant"\|"sparkles"' PetplusApp/src/
```

If either name has zero hits, use the fallback: `"nutrition"` instead of `"restaurant"`, `"water"` instead of `"sparkles"`. Note which names you will use before proceeding.

**Verify**: Command runs without error; you have a confirmed icon name for each category.

### Step 2: Add `icon` field to `CATEGORIES`

In `PetplusApp/src/data/products.ts`, update the `CATEGORIES` array with the confirmed icon names:

```tsx
export const CATEGORIES = [
  { id: 'all',     name: 'Tất cả',   emoji: '🛍️', icon: 'grid' },
  { id: 'thuoc',   name: 'Thuốc',    emoji: '💊',  icon: 'medkit' },
  { id: 'thucan',  name: 'Thức ăn',  emoji: '🍖',  icon: 'restaurant' },  // or 'nutrition'
  { id: 'phukien', name: 'Phụ kiện', emoji: '🪮',  icon: 'paw' },
  { id: 'spa',     name: 'Spa',      emoji: '🛁',  icon: 'sparkles' },    // or 'water'
];
```

Replace `'restaurant'` / `'sparkles'` with your confirmed names from Step 1 if needed.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 3: Use `cat.icon` in `ShopScreen` chip render

In `PetplusApp/src/screens/customer/ShopScreen.tsx`, inside the `CATEGORIES.map` block, change:
```tsx
<Icon name="medkit" size={14} color={...} />
```
to:
```tsx
<Icon name={cat.icon as any} size={14} color={...} />
```

The `as any` cast is necessary because the `Icon` component's `name` prop type is a union of Ionicons string literals and TypeScript cannot narrow it through the `cat.icon` string at compile time. This is the existing pattern used elsewhere in the codebase (e.g., `Icon` is already called with dynamic names via casts in `AppNavigator.tsx`).

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 4: Build

**Verify**: `cd PetplusApp && npm run build` → exits 0.

## Test plan

Manual verification:

- Open the Shop screen. The 5 category chips should each show a different icon: grid, pill/medkit, fork/restaurant, paw, sparkle/water.
- Tap each chip — confirm the icon changes color to white (active) and back to gray (inactive) as before.
- Confirm that filtering still works correctly (tapping "Thuốc" shows only thuoc products).

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] Each of the 5 category chips shows a visually distinct icon
- [ ] The hard-coded `"medkit"` string in the `CATEGORIES.map` render is removed
- [ ] `CATEGORIES` in `products.ts` has an `icon` field on each entry
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 010 updated to DONE

## STOP conditions

- `"grid"` or `"paw"` does not render (check if those names are present in the codebase with grep before using them).
- TypeScript error in Step 3 cannot be resolved with `as any` — stop and report the exact error.
- The `CATEGORIES` array is typed with a strict interface that does not allow adding an `icon` field — stop and report the type definition.

## Maintenance notes

- If new categories are added to `CATEGORIES` in the future, they must also include an `icon` field, otherwise `cat.icon` will be `undefined` and the Icon component may render nothing or throw. Consider adding a TypeScript interface for the category object.
- The `emoji` field in `CATEGORIES` is not currently displayed anywhere in the UI. It could be used as a fallback or in future category cards. Do not remove it.
- If the `Icon` component is updated to have stricter types, the `as any` cast will need to be replaced with a valid icon name string or the type union extended.
