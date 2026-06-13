# Plan 004: Booking And Schedule Flow

## Problem

Booking now creates AsyncStorage appointments and Schedule can edit/cancel them, but the flow still needs a tighter demo story. Appointments start empty, default routing sometimes depends on the first pet being available, and schedule history mutates past appointments into completed state during screen load.

## Goal

Make booking feel reliable and realistic for a single demo account: select pet, branch, doctor/time, confirm, then see the result immediately in Schedule and Home.

## Scope

- Improve Select Branch, Select Doctor, Select Time Slot, Booking Confirmation, Schedule, and Home appointment summary.
- Keep local appointment storage.
- Keep simulated doctor availability.
- Do not add real clinic back-office workflows.

## Implementation Steps

1. Decide whether the demo should start with no appointment or one pre-seeded upcoming appointment, then make Home and Schedule consistent with that choice.
2. Ensure every booking entry point passes a valid `petId` and `petName`; if not, route through pet selection first.
3. Make auto-assigned doctor copy explicit when `doctorId === "auto"` instead of displaying generic doctor text.
4. Improve Schedule empty, upcoming, and history states with clear next actions.
5. Move automatic status rollover into a dedicated service helper so Schedule loading does not silently mutate data in the screen component.

## Acceptance Criteria

- Booking from Home creates an appointment with the selected demo pet.
- Booking from Schedule creates an appointment with a valid demo pet.
- After confirmation, Schedule shows the new appointment without manual refresh.
- Home shows the next appointment after returning from booking.
- Cancel and edit actions update the displayed appointment consistently.

## Verification

- Run `cd PetplusApp && npm run build`.
- Reset demo data, book an appointment from Home, then verify Home and Schedule.
- Cancel the appointment and confirm it moves from upcoming to history.
- Edit branch/doctor/slot and confirm the updated details remain after navigating away and back.
