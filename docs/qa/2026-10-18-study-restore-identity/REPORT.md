# Study retry after restored card edits or movement

B02.4-B2t. Base `1aa9e35`. This extends the existing grade-before-restore audit with four software integration cases. Application source, dependencies, storage formats and simulator data are unchanged.

## Transaction boundary

The real mounted StudyScreen/DeckProvider submits Bien for Alpha's `first` card. The test either holds the grade journal before persistence or allows its journal and rejects its first deck application. A real full-state restore then runs behind that grade or recovers its journal. The restore retains the same global card ID with changed front/back/example/tags/flag/schedule, either in Alpha or moved into Beta. An unchanged Beta card is also retained. The prior removed-target cases remain as controls.

| Grade boundary                     | Restore target                                 | Acceptance                                                                                                                        |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Held journal                       | Removed, edited in Alpha, moved/edited in Beta | Release and finish the grade/restore; imported decks and nine portable state sections stay exact                                  |
| Interrupted first deck application | Removed, edited in Alpha, moved/edited in Beta | Restore recovers the original journal; press the original UI save Retry and wait for its disappearance; imported data stays exact |

All six cases verify the complete restored decks, including replacement content and literal schedule values (reps7, interval18, ease2.1, due18 days later), plus preferences, daily7/new3/target12, streak, seen words, quiz history, notification preferences, missions, plan and imported last session. The retained learning history contains one original self-rated recall event for `first` in **Alpha**, even when that ID now belongs to Beta. The journal clears. Retrying does not grade the restored replacement, increment restored counters or overwrite its imported queue.

React unmount/remount and Continue resume exactly `restored-next`, one remaining card, without the old first/second card or another learning event. Only the expected checkpoint timestamp changes. This is a React/provider restart, not native process termination.

## Verification strength

The existing in-memory AsyncStorage adapter is the external persistence double. Study, provider, grade, restore, learning-history and transaction modules remain real. The held/rejected boundaries control actual journal/deck writes rather than mocking a successful grade or writing its replacement session directly.

An isolated temporary source copy changed `if (prior)` to `if (prior && false)` in `flashcardAnswer.ts`. With the original test wait, the edited case failed but the moved case passed too early: provider reload had already exposed `phrase second`, so finding it did not prove Retry completion. Adding a condition-based wait for the save Retry to disappear made **both new interrupted cases fail**, with the removed-target control passing. The production UI retains its save error until acknowledgement succeeds; this wait observes that boundary. The actual worktree's product source was never mutated. The strengthened tests pass against unchanged product code.

The mutation failures are recoverable-save/acknowledgement failures; they are not evidence that the mutated path committed duplicate history. `verification.json` records source fingerprints and the three case outcomes. These tests protect existing behavior; no new product fix or new card-movement policy is claimed.

Commands:

```sh
npm test -- --runInBand --watchman=false --runTestsByPath __tests__/screens/StudyLifecycleIntegration.test.tsx
npm test -- --runInBand --watchman=false
npm run typecheck
npm run lint
npm run format:check
npm run test:calendar
npm run validate:data
npm run content:validate-reviews
node scripts/audit-theme-colors.js
```

Focused final26/26 pass. Clean baseline117 suites/1,136 tests passed; expanded full-suite results are in `verification.json`. Static/calendar/data/color validation passed; all1,392 teaching cards still await current human editorial acceptance. The full baseline and final runs both report six existing React `act` diagnostic blocks (two in `StudyScreen.test.tsx`, four in `DifficultWordsScreen.test.tsx`); the focused26-case file has none. These pre-existing test warnings are not claimed fixed.

## Remaining scope

This covers an **already-journaled** attempt followed by restore, then its original acknowledgement/retry. A new, previously uncommitted stale grade after restore changes or moves its target is a different ordering and remains unaudited. Restore still requires restart; stale mounted presentation is not an automatic restore handoff. Plan-linked attempts, arbitrary content identity changes/orderings, real storage exhaustion, OS/process interruption, native navigation, Android and signed/physical acceptance remain open. B02.4-B2 is not closed. Existing Home maximum-text/touch/calendar work and human/account dependencies are unchanged. Blocked security work was skipped.
