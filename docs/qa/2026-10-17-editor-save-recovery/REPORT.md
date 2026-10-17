# Editorial save recovery — 2026-10-17

Base `f1de787`. B02.4-B2h handles slow or failed editorial saves without losing the visible draft, duplicating submission or advancing the wrong filtered row.

## Behavior and verification

Capture one immutable save intent (card, filter/index and exact patch/timestamp), lock conflicting inputs and navigation until acknowledgement, catch failure and expose bilingual Retry. Retry uses that same intent. A pending row stays visible even if another coordinated storage operation replays its journal and removes it from the active filter. Mounted-state protection avoids advancing an unmounted editor. Successful acknowledgement clears the lock and advances once according to filter membership.

Native testing also reproduced live text-size clipping. The editor now remounts its presentation subtree on font-scale changes while retaining parent draft/intent state. Large text stacks crowded rows, wraps the English input, scales horizontal filter height and scrolls the action buttons with content. Save feedback appears at the top; failure brings it into view, and success resets the scroll position.

Two initial regressions [failed before implementation](targeted-red.log). [Final focused checks](targeted-green.log): 3 suites / 17 tests, covering double submission, conflicting controls, exact failed-intent retry, live text-size preservation, real-provider journal recovery and actual React Navigation removal prevention. The navigation test uses NavigationContainer and StackRouter, not a mocked Back handler. [Full coverage run](full-suite.log): **93 suites / 906 tests**. Typecheck, zero-warning lint, data validation (47 decks / 1,392 cards/audio entries), calendar-zone tests and formatting passed. Independent review of save logic and subsequent layout changes found no blocking defects and independently reran the focused suite.

## Native checks

Unsigned SDK57 development client, iPhone SE3 / iOS26 clone `C1E8FD8F-7542-4FF8-B36A-F6B4A4C620E0`. UI interactions used CUA; simulator app storage was inspected read-only. The original fixture was preserved. No file-based edits to simulator storage.

The [test-only entry wrapper](native-harness.jsx) ran from an isolated copy, temporarily serving Metro8098. It holds/rejects one actual AsyncStorage deck write, leaving the real provider, journal, UI and navigator in place. It is never imported by the normal app entry. This is deterministic native fault injection, not a real exhausted-disk test.

- Edit synthetic Hola2 to `Hello 2 — QA retry draft`; hold save. Input/filter/skip/save controls lock, the draft and current row remain, saving status appears. [Held state](native-held.png). Native-stack Back during held and failed saves stays on the editor. An attempted edge drag also stayed, but gesture recognition is not established by that attempt.
- Reject write; error and Retry appear. Retry persists the original draft and advances to Hola3, without skipping.
- Edit Hola3, hold/reject, change native text size from 3 to maximum11 while the failed intent exists. Draft survives; retry advances to Hola4.
- With the final feedback placement, edit Hola4, hold/reject and change to maximum11. [Error/Retry are visibly reachable](native-largest-retry.png). A coordinate tap on the visible Retry saves the draft and advances to Hola5. Restore size3; native-stack Back successfully returns to Manage Decks.
- Stop the wrapper server; restore normal Expo entry on8098 from the development worktree. Cold terminate/launch: QA overlay absent, daily3/5. Study → Continue resumes **Hola3 / seven remaining**. [Normal cold resume](native-normal-cold-resume.png).

[Six read-only checkpoints](native-state-check.json) preserve the exact seven-card ordinary queue/session identity, all scheduling fields, daily3/5/new0, six learning events, plan/mission state, preferences, streak and 1,402-card fixture library. Three edited drafts persist; no grade was submitted. These synthetic local edits do not constitute human language acceptance. The unsigned client's known notification-keychain banner remains outside this package.

## Limits

Draft retention is in memory while the editor stays mounted, not a promise that unsaved edits survive process death. Broader OS interruption, actual low-storage hardware behavior, Android, tablet/keyboard and broad touch-scroll/accessibility acceptance remain separate open work. Automated checks cover rapid conflicts; native checks cover held/failing saves, Back, text-size changes, visible retry and cold persistence. The master roadmap remains active.
