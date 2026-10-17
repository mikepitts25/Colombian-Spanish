# Study/editor integration audit — 2026-10-17

Baseline `36c73ac`. B02.4-B2f closes a controlled integration-coverage gap; production code is unchanged. Existing screen tests mocked the provider, while storage/provider tests did not exercise active Study queue behavior through the complete boundary.

## What was exercised

The new test mounts real StudyScreen, DeckProvider, grading, queue persistence and durable coordinator code. Only navigation, seed content, native audio and the official AsyncStorage transport mock are substituted. A two-card custom deck is opened through the normal auto-start route. Tests invoke real provider editor operations while pressing the screen's Good control.

Both grade-first and editor-first **invocation orders** queue two editorial patches, addition of a third card and a deck rename alongside the grade. They verify:

- Corrected answers, review metadata, flags and renamed deck survive in storage and the rendered provider's current deck.
- Exactly one grade is recorded for the initial card, with daily/new count 1/1 and a single self-rated learning event.
- Study advances to the original second card; the new third card does not join the snapshotted session. The saved session identity and exact remaining queue are retained.
- Unmounting/remounting the entire provider and screen, then pressing Continue, resumes only the second card from persisted state. Completing it stores an empty queue, exactly two events/counters, and leaves the third card ungraded.

A third case injects one AsyncStorage failure at the seen-word write, after a durable grade intent exists. The screen offers Retry. A subsequent real editor transaction replays the pending journal before writing its correction. Pressing the visible grade Retry then acknowledges the original attempt: no duplicate daily/new counter or learning event, exact next queue, and the correction remains in both provider and storage. The transport implementation is restored in `finally`.

## Evidence and validation

[Three focused tests pass](targeted-pass.log). These are characterization/integration tests of existing behavior; no reproduced app defect or implementation fix is claimed.

To establish that the queue assertions detect a real regression, a temporary mutation added the active deck object to Study's snapshot-effect dependencies. Both operation-order tests failed: the newly inserted third card entered the durable remaining queue. [Mutation output](queue-mutation.log) records the two failures. The original production file was restored before validation; its git diff is empty.

After restoration, the [full suite](full-suite.log) passed **92 suites / 895 tests**. Typecheck, ESLint with zero warnings and focused Prettier checks passed. Fresh independent review reran the three tests and found no actionable findings. Documentation formatting and git whitespace are checked before integration.

## Remaining acceptance boundary

This proves React/provider/storage integration under controlled concurrent operations and interrupted-write recovery. Component/provider remount is not a native process restart. Provider method calls are not a native editor-navigation test. The prior native exact-queue evidence remains separate; B02.4-B2 stays open for broader relearning, cross-deck/editor navigation and OS interruptions. No physical-device, Android, signed-candidate or human language acceptance is claimed.
