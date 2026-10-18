# Large-text focused input and Save — 2026-10-18

> **Storage provenance update — 2026-10-18:** Current alias evidence includes `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F` → `B51A3777-8E81-4049-B101-C2B18390E2B1`. This historical report did not establish requested-device data-path isolation at capture time. Same-store transitions and UI observations retain their stated scope; independent-store/source-runtime protection is unverified unless separately proved. See the [claim audit](../2026-10-18-simulator-claim-audit/REPORT.md).

B08.5-B8c closes a reproduced Add Card focus defect plus bounded maximum-text acceptance on narrow phone and large tablet. Baseline `230d1f8844fac8315d2493472192252706ae8cdb`; native SDK57 development binary, Metro8098 serving this branch. Parent B08.5-B8 remains open for the wider matrix.

## Defect and correction

On disposable iPhone SE (3rd generation), iOS26 `F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6`, set native Text Size11, open Add Card → Tags, press actual software Q. The value is retained but [the input is mostly beneath the keyboard](phone-max-input-red.png). Existing keyboard avoidance fixes viewport size; it does not reveal a focused input.

The main form now records each field-container y and input-relative y for the current font scale. Focus, keyboardDidShow and viewport shrink reveal the input with a16pt margin. It scrolls the input rather than the potentially very tall label. Incomplete or previous-scale coordinates are ignored; blur clears that focus. No persistence, grading, pending-intent, native header-offset or modal behavior changed. Input accessibility labels remain available when the visual label scrolls offscreen.

Two regressions drive native-layout/keyboard events into the screen and inspect its outgoing native scroll command: measured focused input and keyboard reappearance/blur; and complete current-scale measurements after live resize with draft retention. Both fail against the baseline with zero scroll commands ([RED](red.log)), then pass ([focused GREEN](green.log)). Native geometry comes from the simulator, not those mock command assertions.

## Native acceptance

All UI work used CUA Device Hub; official simctl handled infrastructure, screenshots, termination/launch. Only unsaved synthetic Q drafts and a reversible language toggle were used; no deck/card was created, edited or graded.

- **Spanish narrow phone, native Text Size11:** actual software Q is [fully visible with the entire Save button above the open keyboard](phone-max-input-save-green.png), without swipes. Coordinate Save tap `(1010,650)` reaches the [expected required-front/back alert](phone-max-save-validation.png), without saving. Its full message is in AX; at this maximum native size the alert body is visually clipped behind its OK area. Full native-alert readability/scrolling remains unverified.
- **English narrow phone, Text Size11:** toggle the normal Settings language row, then reopen Add Card/Tags. Actual software Q and the [full English Save action](phone-en-max-input-save.png) are visible above the keyboard. Restore Spanish and native size3; cold restart returns Home with all eleven logical storage hashes restored.
- **Spanish iPad Pro13-inch M4, iPadOS26 `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F`:** its own baseline begins Spanish/Text Size11. Temporarily use size3 to navigate Home → Add Card, tap Tags, press the actual software Q at `(735,1019)`. Change3→11: Q remains. Tap the visible Tags field `(1000,1030)` to reopen software keyboard: [Q and full Save are visible above it](tablet-max-input-save.png). Coordinate Save `(1010,838)` reaches the [fully readable required-field alert](tablet-max-save-validation.png). Dismiss, return Home without saving, cold restart and preserve original native size11. Device Hub omits app AX nodes on this surface; controls were reached through visible coordinates.

VoiceOver/Capture Keyboard remain off. Native appearance remains Light; application remains its existing dark palette. Known unsigned `ERR_NOTIFICATIONS_KEYCHAIN_ACCESS` registration warnings were dismissed visibly; no notification permission, entitlement, signing, account or security setting changed.

## Stored state and verification

Five read-only snapshots in `native-state-check.json` show each device’s exact eleven canonical logical key hashes restored after cold launch. During the English phone phase only UI-language preferences differ. Each keeps47 decks/1,392 cards and an empty write journal; card content/schedules, daily progress, saved queues/plans, events and other learning records remain unchanged. `capture-state.py` retains the collector. Run `python3 docs/qa/2026-10-18-large-text-keyboard/verify-state.py`; this verifies captured storage evidence, not UI semantics.

Full Jest verification: **101 suites / 993 tests passed** ([log](full-suite.log)). Types, lint and project data/editorial-ledger validation pass; all1,392 editorial cards still await current human acceptance. The prior230d1f8 CI39093157973 and board39093157984 succeeded.

Largest-text new-deck/rename modals, longer multiline drafts, tablet English/window modes, other input fields/keyboard types, broader assistive navigation and platform/signed/physical acceptance remain open. This is bounded Tags/Save acceptance, not a complete B08 pass. Security B01.8-C2g remains access-blocked; no retry or bypass. Other human audio-design/editorial/product/account dependencies are unchanged.

Final premerge checks: full formatting and captured-state verification pass; independent review found no issues in the code, regressions or bounded native evidence. The disposable phone clone was shut down after restoration. The original tablet remains at Home with its original maximum text size.
