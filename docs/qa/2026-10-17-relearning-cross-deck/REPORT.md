# Relearning and cross-deck integration audit — 2026-10-17

Baseline main `57530e5`. Added three integration tests through the real Study screen, DeckProvider, durable storage, scheduling and learning-event boundary. Navigation focus/route, seed inventory and native platform modules use the existing Jest test adapters. Application code is unchanged; the unchanged behavior passed this bounded audit.

## Proved software cases

- Again and Hard on a previously new card schedule it 15 minutes and 12 hours later respectively. At one millisecond before its due time it is absent from fresh eligible suggestions; at the due instant it is eligible. The existing unfinished screen queue still contains only the untouched second card.
- Unmount/remount → Continue retains the exact remaining queue and session identity, without inserting the newly due first card or adding evidence/counter credit. Grading the second card ends the saved session. The first card's schedule remains unchanged and the event sequence contains one event for each submitted answer.
- With a daily new-card cap of one, introducing a card in Alpha consumes that one introduction. Switching to Beta creates a distinct session containing its studied due card while withholding its untouched new card. Grading the due card leaves newCount at one.
- At the first card's 15-minute due time, switching back to Alpha permits it as relearning. A Good grade advances total count to three while newCount remains one. The completed Beta deck remains byte-for-value equivalent in loaded data, and exact event identities/qualities are Alpha Again → Beta Good → Alpha Good.

These are controlled scheduler-clock cases using Date.now; they do not simulate a wall-clock calendar day or timezone change. Existing local-day tests cover that separately. They are not native elapsed-time, navigation-stack, OS interruption, every cross-deck race, or all B02.4-B2 acceptance.

## Test sensitivity

A disposable isolated source/test copy was used; Metro-served source was never mutated.

- Baseline: all three tests pass (`baseline.log`).
- Remove remaining-budget subtraction from provider selection: cross-deck test fails because beta-new is wrongly included (`missing-cross-deck-budget.log`).
- Replace saved remaining selection with current eligible selection: both relearning/remount tests fail because first is wrongly inserted after second (`refilled-resume.log`).

These deliberate mutation failures establish sensitivity to the audited invariants. They are not failures observed in the shipped implementation and do not imply a product fix.

Full local suite passed **95 suites / 928 tests** (`full-suite.log`); typecheck and lint passed. Wider native/platform cases remain open in the master plan.

Fresh independent review reran all three focused tests, checked both mutation failures and found no actionable issues or overclaims. Formatting and whitespace checks also passed.
