# Plan 009: Show Pet Name on Prescription Items in Cart

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5eb2386..HEAD -- PetplusApp/src/context/CartContext.tsx PetplusApp/src/screens/customer/CartScreen.tsx PetplusApp/src/screens/customer/ShopScreen.tsx PetplusApp/src/screens/customer/ChatScreen.tsx`
> If any in-scope file changed, compare the "Current state" excerpts before
> proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: UX / clarity
- **Planned at**: commit `5eb2386`, 2026-06-13

## Why this matters

When a prescription drug is added to the cart (either from Shop or from a consultation), the cart item shows a tag that reads "Kê đơn cho pet" — a generic phrase that doesn't tell the customer *which* pet the drug is prescribed for. The `CartItem` interface stores `selectedPetId` but not the pet's display name. In a household with multiple pets, a customer cannot tell at a glance whether they are about to buy medication for the right animal. The fix is to add a `selectedPetName` field to `CartItem` and pass it through all `addItem` call sites, then display it in the cart tag.

## Current state

**`PetplusApp/src/context/CartContext.tsx`** — `CartItem` interface:
```tsx
export interface CartItem {
  product: Product;
  quantity: number;
  selectedPetId?: string;
  selectedConditionId?: string;
  source?: 'shop' | 'consultation';
}
```
No `selectedPetName` field exists.

**`addItem` signature** in the same file:
```tsx
const addItem = (
  product: Product,
  petId?: string,
  context?: { conditionId?: string; source?: 'shop' | 'consultation' }
) => { ... }
```
Pet name is not passed.

**`PetplusApp/src/screens/customer/CartScreen.tsx`** — the prescription pet tag (search for `petTagText`):
```tsx
{item.selectedPetId && (
  <View style={styles.petTag}>
    <Icon name="paw" size={10} color={theme.colors.primaryDarker} />
    <Text style={styles.petTagText}>Kê đơn cho pet</Text>
  </View>
)}
```
The tag always shows the static string "Kê đơn cho pet", never the actual name.

**Call sites that invoke `addItem` with a petId**:
1. `PetplusApp/src/screens/customer/ShopScreen.tsx` — `handleAddToCart`:
   ```tsx
   addItem(product, pet.id, { source: 'shop' });
   ```
   The `pet.name` is available here as `pet.name` from the `petService.getPetsByOwner` result.

2. `PetplusApp/src/screens/customer/ChatScreen.tsx` — inside `handleProductTap`, navigation passes `petId` to `ProductDetailScreen`; the actual `addItem` call is in `ProductDetailScreen.tsx`. Check that file and update it too.

3. Any other screen that calls `addItem` with a `petId` — grep to find them all before editing:
   ```
   grep -rn "addItem(" PetplusApp/src/screens/
   ```

**Repo vocabulary** (from `CONTEXT.md`): the display term for the prescription pet tag should be "Kê đơn cho: {name}" where `name` is the pet's Vietnamese-language display name.

## Commands you will need

| Purpose   | Command                                            | Expected on success    |
|-----------|----------------------------------------------------|------------------------|
| Find sites | `grep -rn "addItem(" PetplusApp/src/screens/`     | Lists all call sites   |
| Typecheck | `cd PetplusApp && npx tsc --noEmit`                | exit 0, no type errors |
| Build     | `cd PetplusApp && npm run build`                   | exit 0                 |

## Scope

**In scope** (the only files you should modify):
- `PetplusApp/src/context/CartContext.tsx`
- `PetplusApp/src/screens/customer/CartScreen.tsx`
- All `addItem` call sites that pass a `petId` (found via the grep above)

**Out of scope** (do NOT touch):
- `addItem` call sites that do NOT pass a petId (OTC products) — they should remain unchanged
- Any Firestore service or data model
- Cart persistence logic (AsyncStorage if any)
- The order creation payload in `CartScreen.tsx` — the `orderId`/`petId` field is separate and must not be changed

## Git workflow

- Branch: `advisor/009-cart-prescription-pet-name`
- Commit message: `feat: show pet name on prescription cart items`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add `selectedPetName` to `CartItem`

In `PetplusApp/src/context/CartContext.tsx`, update the `CartItem` interface:
```tsx
export interface CartItem {
  product: Product;
  quantity: number;
  selectedPetId?: string;
  selectedPetName?: string;   // add this line
  selectedConditionId?: string;
  source?: 'shop' | 'consultation';
}
```

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 2: Add `petName` parameter to `addItem`

Update the `addItem` function signature and body. Change:
```tsx
const addItem = (
  product: Product,
  petId?: string,
  context?: { conditionId?: string; source?: 'shop' | 'consultation' }
) => {
```
to:
```tsx
const addItem = (
  product: Product,
  petId?: string,
  context?: { conditionId?: string; source?: 'shop' | 'consultation'; petName?: string }
) => {
```

Inside the function body, wherever `selectedPetId: petId` is set on a new item, also set `selectedPetName: context?.petName`. There are two places inside `addItem`: the "update existing" branch and the "add new" branch. Update both.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0 (TypeScript will now flag call sites that need updating — that is expected and guides Step 3).

### Step 3: Update all `addItem` call sites that pass a `petId`

Run:
```
grep -rn "addItem(" PetplusApp/src/screens/
```

For each call site where a `petId` is passed and the pet name is available in scope, add `petName: pet.name` (or the relevant variable) to the context object. Example in `ShopScreen.tsx`:

Before:
```tsx
addItem(product, pet.id, { source: 'shop' });
```
After:
```tsx
addItem(product, pet.id, { source: 'shop', petName: pet.name });
```

For call sites in `ProductDetailScreen.tsx` (opened from chat), the pet name should already be available via `route.params` (check the params passed from `ChatScreen.tsx`'s `handleProductTap` — `petId` is passed; if `petName` is not, it needs to be added to the navigation params and the ProductDetailScreen route.params destructuring).

For any call site where the pet name is not in scope (e.g., only `petId` is available), do NOT fetch the pet just for the name in this step — leave `petName` undefined. The cart will show the generic tag for that edge case.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0 (no type errors remaining).

### Step 4: Update `CartScreen` to display the pet name

In `PetplusApp/src/screens/customer/CartScreen.tsx`, find the `petTagText` section:
```tsx
{item.selectedPetId && (
  <View style={styles.petTag}>
    <Icon name="paw" size={10} color={theme.colors.primaryDarker} />
    <Text style={styles.petTagText}>Kê đơn cho pet</Text>
  </View>
)}
```
Replace with:
```tsx
{item.selectedPetId && (
  <View style={styles.petTag}>
    <Icon name="paw" size={10} color={theme.colors.primaryDarker} />
    <Text style={styles.petTagText}>
      Kê đơn cho: {item.selectedPetName || 'pet'}
    </Text>
  </View>
)}
```

The fallback `'pet'` handles the edge case where `selectedPetName` was not populated.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 5: Build

**Verify**: `cd PetplusApp && npm run build` → exits 0.

## Test plan

Manual verification:

- Add an OTC product to the cart. Confirm no pet tag appears on that cart item.
- Start a consultation, select a condition, tap a recommended product, and proceed to cart. The cart item for that prescription should show "Kê đơn cho: {petName}" where `{petName}` is the pet's actual name (e.g., "Kê đơn cho: Mochi").
- Go to Shop, add a prescription product directly. The pet name should appear on the cart tag.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] `CartItem` interface has `selectedPetName?: string`
- [ ] `addItem` context accepts `petName?: string`
- [ ] CartScreen tag reads "Kê đơn cho: {petName}" when name is available, "Kê đơn cho: pet" as fallback
- [ ] OTC items (no petId) are unaffected — no tag shown
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 009 updated to DONE

## STOP conditions

- The `CartItem` interface is not in `CartContext.tsx` (file structure drifted — grep for it).
- `addItem` has a different signature than described (more or fewer params).
- A call site passes `petId` but the pet name cannot be obtained without an async fetch — stop and report; do not add async logic to `addItem`.
- TypeScript errors after Step 3 in files outside the scope list.

## Maintenance notes

- If the CartContext is ever persisted to AsyncStorage, the `selectedPetName` string will be stored alongside `selectedPetId`. This is safe.
- If the pet is renamed after being added to the cart, the cart will still show the old name. This is acceptable for the demo scope — it's a snapshot at add-to-cart time.
- Plan 005 ("Quick Chat And Prescription Flow") may also touch cart/product-detail navigation params. If both plans are executed, confirm the `petName` param is not double-added or conflicted.
