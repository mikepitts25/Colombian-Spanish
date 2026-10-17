# Daily-plan layout and lifecycle verification

> **For agentic workers:** Execute serially in the existing isolated worktree. Reproduce issues before fixes, use regression tests and one fresh review for product changes.

**Goal:** Finish available iOS layout/lifecycle checks for the whole daily plan; keep Android/signing/physical acceptance separate.

**Architecture:** Existing Home → exact Study → DailyPlan/Mission player; exercise real native UI on dedicated narrow and tablet fixtures, large text, keyboard and navigation/OS interruptions. Any fixes must preserve durable identities, progress and editorial gates.

**Tech Stack:** Existing Expo57/iOS unsigned simulator client, CUA, Jest/TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-17-durable-daily-plan.md` and `2026-10-17-applied-active-timing.md`.

## Checks

- [ ] Narrow iPhone: English/Spanish Home, review, applied prompt/input/keyboard/feedback/complete; scroll and touch access at default/large text, safe areas and recovery/end controls.
- [ ] Tablet: matching flow at default/large text, keyboard and scroll; preserve exact phase through navigation and OS background/cold restart.
- [ ] Pin actual regressions before fixing, verify failure then pass; preserve pending write/retry identity, uncertain timing and no SRS inflation.
- [ ] Full appropriate checks/review, evidence report and master status, merge/push and CI. Do not close a mixed gate solely from iOS evidence.

## Execution record

Observed RED parent End enabled during pending linked answer; GREEN after synchronous player saving notifications and parent guard. Observed RED player unmount never releases parent saving gate; GREEN with paired notifications independent of local mounted state and a parent pending counter. Native RED tablet largest live text clipped all labels; the existing app pattern of font-scale keyed presentation reflows fixes it without remounting player state. Automated check preserves entered text and exact run through scale changes, including a pending answer. Native RED narrow screen pinned End consumes roughly half the screen; structural regression fails before moving recovery actions into the same safe-area/keyboard-aware response scroll, then passes.

Final local: 90 suites / 876 tests, types/lint/format/calendar/data/editorial pass. Native evidence includes tablet Spanish default review/applied and largest live reflow; narrow English review/applied keyboard/submit, cold feedback resume, navigation away/back, English→Spanish feedback and completion at largest text. Daily/SRS/events unchanged through final completion. Tablet final keyboard/completion and complete-screen touch scrolling are still unverified; Device Hub Raise returned noWindowsAvailable after reattachment. Do not close the broad mixed acceptance gate. Fresh review and integration pending.

Ruling: recovery/End scrolls with the response instead of remaining pinned — fixes cramped large-text/keyboard layouts; ending may require scrolling to the action.

Ruling: refresh only presentation scrolls on font-scale change — preserves controlled answer and pending intent, with scroll position reset on an actual text-size change.
