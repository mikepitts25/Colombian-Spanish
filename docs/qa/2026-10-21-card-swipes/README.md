# Card swipe gesture repair — October 21, 2026

The owner reported that cards pull down and then fail to swipe left/right.
Study wraps the card in a vertical ScrollView with default iOS bounce behavior.
Flashcard claimed horizontal movement only in the responder bubble phase, and
React Native's default termination policy allowed it to yield an acquired swipe.

The session ScrollView now disables bounce and enables directional locking.
Flashcard also claims horizontal movement in the capture phase and refuses
responder termination requests once it owns the gesture. Vertical movement is
still left to the page so content-sized accessibility cards remain scrollable.
The existing distance threshold, grades, flip and audio behavior are unchanged.

## Verification

- Added regression cases first: both horizontal directions and responder retention
  failed against the previous implementation, as did the session bounce contract.
- Focused Flashcard/Study suite: 2 suites, 90 tests passed.
- TypeScript, ESLint on the four changed source/test files, and Prettier checks passed.
- The full-suite theme consumer audit reports existing classification drift in
  StudyScreen and appTheme. Running the audit with the swipe-specific ScrollView
  changes removed in memory produces identical errors after line normalization.
- Full Jest run: 116 suites passed, 1 failed; 1,197 tests passed, 2 failed.
  Both failures are in `__tests__/styles/themeConsumerAudit.test.ts`: the full-runtime
  classification test and the metric-only/static-palette injection test.

Physical-device swipe feel and native gesture arbitration have not been verified.
This source change has not been included in a new TestFlight build.
