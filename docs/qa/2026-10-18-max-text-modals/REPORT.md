# Maximum-text deck dialogs — 2026-10-18

> **Storage provenance update — 2026-10-18:** Current alias evidence includes `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F` → `B51A3777-8E81-4049-B101-C2B18390E2B1`. This historical report did not establish requested-device data-path isolation at capture time. Same-store transitions and UI observations retain their stated scope; independent-store/source-runtime protection is unverified unless separately proved. See the [claim audit](../2026-10-18-simulator-claim-audit/REPORT.md).

Baseline `674a2dd789b13c44bd74bd9ec8db9e9d7dececd9`, native SDK57 development binary and Metro8098. This batch adds evidence only; no runtime code or tests changed. Continue B08.5-B8 with bounded Spanish largest-text New Deck/Rename software-keyboard acceptance. The parent stays open.

## Method and observations

CUA Device Hub performed all UI interactions. Official simctl handled boot/launch/termination, screenshots and read-only own-app storage. Native appearance Light, app's existing dark palette, VoiceOver and Capture Keyboard off. Text Size11 is the maximum offered by Device Hub. Phone starts/restores size3; tablet starts/restores size11. No Create/Save, Reset, Delete, study grade or practice action was submitted.

### Narrow phone: Spanish New Deck and Rename

Disposable iPhone SE3 / iOS26 `F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6`:

- At default size, Home → Add Card → Choose Deck → New Deck. Change native size3→11, focus name and press the actual software Q key. Drag `(1200,680)`→`(1200,420)` inside the modal. [Both complete Cancel/Create actions are above the still-open keyboard](phone-es-new-deck-actions.png); the retained Q field is partially above the viewport at this scrolled position. Cancel by visible coordinate `(1010,509)`, without creating a deck.
- Restore size3 and navigate Settings → Manage Decks → Rename Verbos Esenciales. Press actual software q, then resize3→11. Draft `Verbos Esencialesq` is retained. An initial drag dismisses keyboard; refocus the field, then another actual q replaces the selected suffix, producing `Verbos q`. Drag on the visible Cancel action `(1100,650)`→`(1100,420)`: [full Cancel/Save actions are above the open keyboard](phone-es-rename-actions.png), with retained draft text above. Coordinate Cancel `(1010,530)` closes without saving. Stored name remains Verbos Esenciales.

These checks establish action reachability after touch scrolling, not simultaneous full title/input/action visibility or a complete touch-only navigation flow: AX actions were used for navigation/focus/key activation on phone. New Deck/Rename save persistence was tested separately in the prior disposable-fixture lifecycle batch.

### English phone: bounded draft/cancel check

At native size3, toggle the normal Settings language row to English. Reopen Rename at size11 and press actual software q: the original name plus q is retained. Several attempted outer drags dismiss the keyboard; dragging within the TextInput does not reveal the outer actions. Set the exposed draft field to Q through its settable AX value, refocus and press software Q, yielding QQ. [Both actions are readable after keyboard dismissal](phone-en-rename-keyboard-dismissed.png). Coordinate Cancel `(1010,830)` closes without saving. Restore native size3 and Spanish via Settings, then cold-launch Home.

**English keyboard-open Rename action visibility remains unverified.** Do not infer an app defect from these input/scroll observations, or claim this English case passed keyboard-open acceptance. English New Deck, arbitrary long drafts and the wider touch/assistive/window/platform matrix remain open.

### Large tablet: Spanish New Deck and Rename

Original iPad Pro13 M4 / iPadOS26 `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F`. App AX nodes are omitted by Device Hub on this surface; all app controls/keys used visible coordinates.

- Temporarily size3 for navigation: Home Add `(1210,829)` → chooser `(1010,347)` → New Deck `(1010,315)`. Set size11, focus name `(1010,650)`, press actual software Q `(735,1019)`. [Full name input and Cancel/Create actions sit above the open keyboard](tablet-es-new-deck-actions.png), without scrolling. Cancel `(1010,580)` returns to the unchanged card form.
- Back to Home, temporarily size3, Settings `(1300,1180)` → Manage Decks `(1000,466)` → first Rename `(700,553)`. Actual software q `(735,1019)` appends to the existing name. Resize3→11: [full retained `Verbos Esencialesq` input and Cancel/Save actions remain above the keyboard](tablet-es-rename-actions.png). Coordinate Cancel `(1010,583)` closes; unchanged original name is visible in the list. Home action `(1010,310)` returns Home at original size11.
- Cold terminate/launch, observe Spanish Home at size11 and dismiss the known unsigned notification registration warning by visible close control. No permission, entitlement, signing or security setting changed.

## Stored-state evidence and checks

Five snapshots in `native-state-check.json`: phone baseline; English-only phone preferences phase; independent tablet baseline; phone cold-restored; tablet cold-restored. Each has47 decks/1,392 cards and no write journal. `verify-state.py` checks the exact eleven-key set, devices, phase order, counts, per-device baseline/cold hash equality, and an intermediate preference change confined to Spanish→English. Its passing result establishes no durable content, schedule or learning-credit change; it does not prove UI semantics. The collector is retained in `capture-state.py`.

The disposable phone is shut down after restoration; original tablet remains booted at Home/Spanish/size11. Baseline CI39094401740 and checklist deployment39094401656 completed successfully. Fresh screen regressions pass:2 suites/16 tests (`screen-tests.log`); full formatting check passes (`format.log`). Independent review of all five screenshots, report, collector/verifier, captured hashes and checklist found no issues. No app code changed.

Broader B08.5-B8 stays open for English keyboard-open dialogs, longer multiline drafts, other fields/keyboard types, tablet English/window modes and full assistive/platform acceptance. Security B01.8-C2g remains access-blocked and skipped. Written downloadable-audio design approval, editorial acceptance, rights/recordings, product/provider/account/signing and physical/human acceptance dependencies remain unchanged.
