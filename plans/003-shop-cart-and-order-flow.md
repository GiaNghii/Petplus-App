# Plan 003: Shop Cart And Order Flow

## Problem

Shop and product detail are now significantly improved, but the purchase journey still has demo rough edges. Cart checkout starts with an empty delivery address, order history displays product IDs instead of product names, and some prescription/recommendation states can feel disconnected from the pet consultation story.

## Goal

Make the shop journey feel complete from product discovery to checkout confirmation to order history.

## Scope

- Improve Shop, Product Detail, Cart, Order Confirmation, and Order History.
- Keep payment simulated.
- Keep AsyncStorage orders.
- Keep local product assets and Firestore fallback behavior.

## Implementation Steps

1. Prefill demo checkout fields with a realistic default address and note placeholder so checkout is fast on external devices.
2. Persist enough order item data to render product names, prices, quantities, image references, and prescription flags in order history.
3. Update Order History to show real product names instead of `Thuốc #id`.
4. Add a clearer simulated payment state: COD, Momo, and bank transfer should all produce understandable confirmation copy.
5. Connect prescription product purchases back to the selected pet where possible, especially when product detail is opened from Chat.

## Acceptance Criteria

- Tester can add a product, check out, see confirmation, and later find the same order in Order History.
- Order History shows readable product names, not product ID fragments.
- Checkout can be completed quickly without typing unnecessary demo data.
- Prescription items clearly show whether they came from chat or normal shopping.
- Cart totals, delivery fee, and final total match between Cart and Order Confirmation.

## Verification

- Run `cd PetplusApp && npm run build`.
- Reset demo data, buy one normal product, and verify Order History.
- From Chat, open a recommended product, buy it, and verify pet/prescription context is retained where the UI claims it.
