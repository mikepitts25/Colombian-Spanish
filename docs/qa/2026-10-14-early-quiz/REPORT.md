# Early quiz practice

Date: October 14, 2026. Base: `dfedacf`. Scope: B04.2 and a bounded B04.5-A verification package. Simulator: dedicated Colombian Spanish QA iPhone 16 Pro, iOS 26.0, Xcode 27 Device Hub, Expo Go 54.0.7. Local development JS served on port 8094. No signed-release or hardware acceptance is claimed.

## Delivered behavior

- A quiz can start after one studied word, instead of waiting for ten. Questions still use only cards in persisted seen-word history that exist and match the selected region. Duplicate history IDs cannot create repeated prompts or inflate the available count.
- Rounds use up to ten prompts, prioritizing due studied cards. Short rounds report their actual length and score; the start screen describes the maximum size in English and Spanish.
- An empty studied pool retains its Study action. A library without distinct answer meanings still cannot produce a scored one-choice question. Distractors continue to come from the library; this batch does not certify their semantic plausibility, regional equivalence, or grammatical appropriateness.
- Successful results say recognition rather than claiming strong unaided recall. Existing event identity/retry handling, recognition-only observations, and separation from flashcard scheduling remain intact.
- Simulator testing exposed an existing layout defect: after an answer, the completion action was below the viewport in a non-scrollable active quiz view. The question, options, feedback, save retry, and next/results action now share a vertical scroll area. Each session/question gets a fresh scroll instance so advancing starts at the top.

## Automated evidence

The unchanged baseline passed 40 suites / 376 tests. New short-round/history/region expectations failed before implementation. A further completion-action scroll regression failed before the layout correction. Final verification and CI evidence are recorded after execution below.

Coverage includes a completed one-word round with recognition-only evidence, two distinct studied prompts despite duplicate history entries, a one-word region with two answer options, an empty-region fallback, the ten-question cap for larger pools, current translations, distinct meanings, unusable pools, answer/completion save retries, and unchanged flashcard data. Existing no-word English/Spanish expectations now describe one required word.

## Interactive iOS evidence

1. Existing QA storage had one distinct studied word (maleta). Quiz offered a one-question round immediately: [start screen](01-one-word-start.png).
2. Selected an empty Paisa pool, then Study now; this opened Study. Returning through Home to Quiz remounted the screen and showed the available studied pool correctly. No navigator change was needed.
3. Answered maleta → suitcase correctly. Captured the original [clipped feedback](02-feedback-clipped-before.png), then verified the corrected scroll allows reaching [See results](03-scrollable-feedback.png) and completing 1/1.
4. Repeated the one-question round with a deliberately wrong response, saw [Answer: suitcase](04-incorrect-feedback.png), and completed 0/1. Progress then showed [1/2 recognition answers correct](05-recognition-progress.png), one card in review, and the same flashcard daily count **2/5**. Recognition practice did not inflate the daily flashcard goal.
5. Studied ticket through the real Study screen. Home changed to 3/5 from that flashcard review. Reopening Quiz showed two available studied words. A two-question round completed 2/2.
6. On the final layout, repeated the two-question round, scrolled down to Next question, then verified the new [second prompt appears at the top](06-next-prompt-top.png). Completed that round as well. No fixture storage edits, destructive simulator reset, account actions, or other project simulator changes were performed.

Independent review reran 16 targeted tests. It identified the scroll-position reset requirement; the final question/session key was confirmed in follow-up with no remaining blockers within scope.

## Limits

B04.1 semantic distractor review and B04.3 new exercise modes remain open. This is multiple-choice recognition, not measured speaking, listening, unaided recall, retention, or learning effectiveness. Hints/accepted variants, extensive accent/punctuation fixtures, large text, narrow/tablet layouts, real screen-reader behavior, Android interaction, physical devices, and signed-release validation remain open. Spanish zero-state copy has automated coverage; these simulator screenshots use English. Partial storage failures across independent streak/result writes remain a separate reliability concern.

## Final verification and integration

**40 suites / 380 tests passed** on the final tree, plus TypeScript, ESLint, Prettier, data validation, deterministic content inventory comparison, and `git diff --check`. Inventory remains 47 decks / 1,392 cards / 1,392 audio mappings. Independent follow-up found no remaining blockers; actual iOS one- and two-question flows passed as described above. Hosted CI and main integration evidence are recorded in the master work log after push.
