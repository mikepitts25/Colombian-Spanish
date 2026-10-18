# Native deck/card lifecycle and keyboard follow-up — 2026-10-18

> **Storage provenance update — 2026-10-18:** Current alias evidence includes `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F` → `B51A3777-8E81-4049-B101-C2B18390E2B1`. This historical report did not establish requested-device data-path isolation at capture time. Same-store transitions and UI observations retain their stated scope; independent-store/source-runtime protection is unverified unless separately proved. See the [claim audit](../2026-10-18-simulator-claim-audit/REPORT.md).

Baseline `6315e47`, identical application code to implementation `649618b`. Evidence-only follow-up to B08.5-B8; no application, dependency, content or security changes.

## Completed native save lifecycle

On dedicated iPad mini A17 Pro / iPadOS26 E66076BE-D9F8-49FB-870F-F29B57C4CA40, using CUA Device Hub and normal app controls:

1. Created a disposable deck named `12345`. Numeric synthetic text avoided the previous word-autocorrect issue. Read-only storage confirms exactly one new custom deck with zero cards.
2. Entered front `12345`, back `67890`, left optional fields blank, and pressed Save once. Native success alert named the intended deck (`card-saved.png`); fields cleared. Storage confirms exactly one custom card, reps/interval zero, no grade.
3. Filtered management by `12345`, opened Rename, appended `6`, then changed native Text Size3→11. The draft `123456` survived. Visible maximum-text Save committed the name; one-card count and search remained (`rename-saved-max.png`).
4. An upward CUA coordinate drag scrolled the management list to its lower content. All Rename/Reset/Delete controls were visible (`manage-lower-touch.png`). VoiceOver was off; no accessibility auto-positioning used for this drag.
5. Terminated and relaunched normally. Restored text size3, dismissed the known unsigned notification-registration banner, reopened management and filtered again. The renamed deck/one-card count persisted (`cold-fixture.png`), as did exact saved card content/identity/schedule.
6. Pressed Delete only on this agent-created deck. The confirmation named `123456` and warned that its cards would be removed. Confirmed the disposable fixture deletion. The filtered row disappeared. A second cold launch and read-only snapshot confirm the original 47-deck/1,392-card library and all eleven logical hashes restored exactly.

The fixture is synthetic UI test data, not reviewed Spanish teaching content. No existing deck was reset or deleted, no card was studied, and no permission/signing/account change was made.

## Larger-tablet keyboard check

Selected existing dedicated iPad Pro13-inch M4 / iPadOS26 A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F. It began Spanish, native Text Size11, VoiceOver/Capture Keyboard off. Took its own storage baseline before navigation.

At text size3, Add Card opened the software keyboard when the front field was tapped, and Save was fully visible above it. Tapped the actual software Q key. Changing to size11 retained the unsaved `Q` and dismissed the keyboard. Reopening the field showed the software keyboard (`tablet-max-keyboard.png`), with lower fields/Save below it. Two touch-style upward drags dismissed the keyboard, exposing all form fields/Save; they did not establish lower-control access while the keyboard stays open. Tapping the lower Tags field reopened the keyboard but did not establish visible automatic positioning of the field above it.

Returned via Back without saving. Restored the original largest text (11), Spanish Home, VoiceOver and Capture Keyboard off. All eleven logical hashes match this tablet's own baseline; its prior completed plan and learning state are unchanged. No new card was added on this device.

## Verification and remaining scope

Run `python3 docs/qa/2026-10-18-deck-native-lifecycle/verify-state.py`. Nine read-only snapshots prove deck/card identity/count transitions, exact rename/cold content persistence, no added learning credit, only SRS_DECKS_V3 varying during the mini fixture, and eleven-key restoration on both devices. The saved queue/events/counters/preferences never changed. The verifier checks storage evidence; UI claims come from observed screens and actions.

B08.5-B8a closes the bounded Spanish mini save/rename/restart/cleanup and maximum lower-management drag, with a larger-tablet software-key/draft check. B08.5-B8 remains open for keyboard-open lower-field/Save positioning, new-deck/rename modal keyboard behavior, bilingual/narrow/window matrices and assistive navigation/announcements. App accessibility nodes were omitted on both Device Hub surfaces. These observations do not establish a physical/Android/signed/assistive-user pass or by themselves diagnose a product defect. Security access remains blocked in B01.8-C2g and was not retried.

Prior documentation commit6315e47 now has successful [CI39088257803](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39088257803) (all four jobs) and [board39088257917](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39088257917). The application suite remains 100 suites /985 tests as verified on the unchanged implementation and merged checkout; this evidence-only batch adds no application tests.

Fresh whole-branch evidence review found no Critical/Important issues. The verifier also pins device/key-set identity and the saved card's exact initial field set/schedule, addressing optional review hardening.
