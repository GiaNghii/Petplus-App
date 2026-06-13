# Plan 005: Quick Chat And Prescription Flow

## Problem

Quick Chat now gives the demo a strong consultation angle, but the flow is still only partially connected. Recommendations appear in chat, product detail can open from them, and cart can buy products, but the prescription state and pet context need to be more explicit and persistent.

## Goal

Make the consultation journey feel like a coherent demo: choose a pet issue, receive doctor recommendations, buy the recommended product, then see the purchase reflected as part of that pet's history.

## Scope

- Improve Chat, QuickChatPanel, quick-chat data, Product Detail, Cart, and Pet Detail history touchpoints.
- Keep responses simulated.
- Keep single-account, no-login behavior.
- Do not build real doctor messaging.

## Implementation Steps

1. Preserve `petId`, condition ID, and treatment source when navigating from Chat to Product Detail and Cart.
2. Mark recommended treatment products with clear states: suggested, previously prescribed, and purchased for this pet.
3. Replace generic wait/toast behavior with a more demo-friendly simulated doctor response sequence.
4. Add a small consultation summary card after recommendations so the tester understands what happened.
5. Reflect prescription purchases in the pet detail medical or treatment history using existing local order data.

## Acceptance Criteria

- Chat recommendation cards clearly state why each product is suggested.
- Product Detail knows when it was opened from a consultation.
- Checkout preserves the pet and condition context for recommended products.
- Pet Detail can show purchased prescription/treatment history for that pet.
- The flow still works if the tester skips manual chat input and only uses quick conditions.

## Verification

- Run `cd PetplusApp && npm run build`.
- Reset demo data, open Chat for the selected pet, choose a condition, buy a recommended product, and verify the order appears in the right surfaces.
- Repeat with a product already present in demo order history and confirm the UI does not duplicate or mislabel prescription status.
