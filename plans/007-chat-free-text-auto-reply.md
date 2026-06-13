# Plan 007: Auto-Reply to Free-Text Chat Messages from the Doctor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5eb2386..HEAD -- PetplusApp/src/screens/customer/ChatScreen.tsx`
> If the file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as
> a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction / flow
- **Planned at**: commit `5eb2386`, 2026-06-13

## Why this matters

When a user types a free-text message in the Chat screen (rather than using the QuickChatPanel condition selector), `sendMessage()` appends their message and shows a full-screen modal overlay saying "Vui lòng chờ bác sĩ phản hồi" for 2 seconds — and then silence. No doctor reply ever arrives. The `AUTO_REPLIES` array (26 entries, lines 26–35 of `ChatScreen.tsx`) is defined but never called. In a demo context, a user who types anything gets a broken experience that implies the chat simply stopped working. Wiring the existing `AUTO_REPLIES` into a short `setTimeout` in `sendMessage` gives free-text messages the same "live consultation" feel as condition-based replies, at near-zero implementation cost.

## Current state

`PetplusApp/src/screens/customer/ChatScreen.tsx`:

**Lines 26–35** — `AUTO_REPLIES` array defined but never used:
```tsx
const AUTO_REPLIES = [
  'Dạ em hiểu rồi ạ. Anh/chị có thể mô tả thêm triệu chứng không?',
  'Em sẽ kiểm tra lại hồ sơ của pet. Anh/chị vui lòng chờ nhé.',
  'Theo em thấy thì tình trạng này khá phổ biến. Em sẽ kê đơn thuốc phù hợp.',
  // ...8 more entries
];

let replyIndex = 0;
```

**`sendMessage` function (approx lines 103–120)** — sends customer message but never triggers a doctor reply:
```tsx
const sendMessage = () => {
  if (!inputText.trim()) return;

  const newMessage: Message = {
    id: Date.now().toString(),
    text: inputText,
    sender: 'customer',
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, newMessage]);
  setInputText('');
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2000);

  if (showQuickChat) {
    setShowQuickChat(false);
  }
};
```

Notice: `setShowToast(true)` triggers the blocking modal overlay. After this plan, the toast behavior should be replaced by an actual doctor reply.

**`replyIndex` counter** at file scope (line immediately after `AUTO_REPLIES`) cycles through the array. It is also never used in the component.

**Existing pattern for doctor messages** (from `handleSelectCondition`):
```tsx
setTimeout(() => {
  const introMsg: Message = {
    id: (Date.now() + 1).toString(),
    text: introText,
    sender: 'doctor',
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, introMsg]);
}, 1500);
```
Match this pattern: append a doctor message via `setMessages` inside a `setTimeout`.

## Commands you will need

| Purpose   | Command                                            | Expected on success    |
|-----------|----------------------------------------------------|------------------------|
| Typecheck | `cd PetplusApp && npx tsc --noEmit`                | exit 0, no type errors |
| Build     | `cd PetplusApp && npm run build`                   | exit 0                 |

## Scope

**In scope** (the only file you should modify):
- `PetplusApp/src/screens/customer/ChatScreen.tsx`

**Out of scope** (do NOT touch):
- `QuickChatPanel.tsx` — condition-based replies are already working; do not change that path
- `ChatContext` or any Firestore service — this is simulated chat; no real backend
- `AUTO_REPLIES` array contents — only wire it up, do not rewrite it
- Any doctor-side screens

## Git workflow

- Branch: `advisor/007-chat-auto-reply`
- Commit message: `feat: wire AUTO_REPLIES to free-text chat messages`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Remove the blocking toast modal from `sendMessage`

In `PetplusApp/src/screens/customer/ChatScreen.tsx`, in the `sendMessage` function, remove the two toast lines:
```tsx
setShowToast(true);
setTimeout(() => setShowToast(false), 2000);
```

The `showToast` state, `Modal` JSX (search for `visible={showToast}`), and related `toastOverlay`/`toastCard`/`toastText` styles can also be removed since they are used nowhere else. Removing the toast requires also deleting:
- `const [showToast, setShowToast] = useState(false);` state declaration
- The `<Modal visible={showToast} ...>` block and its contents in the JSX return

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 2: Add doctor auto-reply inside `sendMessage`

After the `setInputText('')` line inside `sendMessage`, add:

```tsx
// Cycle through AUTO_REPLIES in order so replies feel varied across a session
const replyText = AUTO_REPLIES[replyIndex % AUTO_REPLIES.length];
replyIndex += 1;

setTimeout(() => {
  const autoReply: Message = {
    id: (Date.now() + 1).toString(),
    text: replyText,
    sender: 'doctor',
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, autoReply]);
}, 1500);
```

The delay of 1500ms matches the existing pattern in `handleSelectCondition`.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 3: Clean up unused toast styles

In the `StyleSheet.create({...})` at the bottom of the file, remove the now-unused style entries: `toastOverlay`, `toastCard`, `toastText`. This prevents TypeScript/lint warnings about unused declarations.

**Verify**: `cd PetplusApp && npx tsc --noEmit` → exits 0.

### Step 4: Build

**Verify**: `cd PetplusApp && npm run build` → exits 0.

## Test plan

Manual verification (no unit test infrastructure exists for this project):

- Open the Chat screen from the Home quick action or Tư vấn tab.
- Do NOT use the QuickChatPanel. Type a message manually and tap Send.
- After ~1.5 seconds, a doctor reply bubble should appear with one of the `AUTO_REPLIES` strings.
- Send a second message; confirm a different reply appears (replyIndex increments).
- Confirm the blocking modal overlay no longer appears at any point.
- Verify that condition-based quick-chat flow (selecting a condition from the panel) still works as before.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] Typing a free-text message triggers a doctor reply after ~1.5 s
- [ ] The full-screen blocking toast modal is removed
- [ ] Condition-based `handleSelectCondition` replies are unaffected
- [ ] `showToast` state, Modal JSX, and toast styles are deleted
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 007 updated to DONE

## STOP conditions

- `sendMessage` function does not match the excerpt (file drifted).
- `AUTO_REPLIES` array is empty or has been removed.
- The `showToast` modal is used by more than the `sendMessage` path (grep for `setShowToast` before removing).
- Step 2's verify fails — e.g., TypeScript error about `replyIndex` scope or `Message` type.

## Maintenance notes

- `replyIndex` is a module-level `let` — it resets to 0 when the JS module is reloaded (app restart). This is intentional: replies cycle per session, not per conversation.
- If real-time Firestore messaging is added later, this entire `AUTO_REPLIES` mechanism should be removed; real replies from the doctor will arrive via the subscription.
- The 1500ms delay matches the existing `handleSelectCondition` intro message delay. If that delay ever changes, update both to keep them consistent.
- Plan 005 ("Quick Chat And Prescription Flow") covers the prescription/product link path inside `handleSelectCondition`. This plan only touches the free-text `sendMessage` path. The two do not interfere.
