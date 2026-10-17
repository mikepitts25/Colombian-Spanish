# Native touch scrolling and tablet software keyboard — 2026-10-17

Product baseline: `460ff55`. This package records native acceptance evidence; no application code changed.

## Environment and fixture setup

Device Hub, existing unsigned Expo SDK 57 development client, Metro port 8098. Dedicated iPhone SE 3/iOS 26 fixture `E66A88D6-CC87-4F46-A197-3F97EE9ED8CB` and cloned 13-inch iPad M4/iPadOS 26 fixture `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F`. UI actions used CUA; state snapshots were read-only AsyncStorage inspection. No app storage was edited through the filesystem.

The tablet clone began from the prior completed QA fixture. A version-3 backup retaining actual decks, preferences, counters and three learning events, with only the completed current daily-plan pointer cleared, was restored through the normal backup preview/Restore UI. Completed mission history was retained. A fresh plan was then started normally. This is controlled QA setup, not evidence of a production reset feature.

## Verified narrow Study behavior

- At default text size, an upward touch drag exposes all four full grading labels and intervals above the bottom tabs: Again 15m, Hard 12h, Good 10d, Easy 12d. See [default scroll](narrow-default-scroll-es.png).
- At largest text size, Good 10d and Easy 12d are fully reachable above the fixed tabs. See [largest text](narrow-largest-good-easy-es.png).
- A coordinate touch on Good grades only `catchup-2`: daily count 2→3, new count remains 0, events 5→6, ordinary queue 8→7. The separate linked catch-up plan remains unchanged in its applied phase. This ordinary review was opened after the prior catch-up package; it is not an extra linked-plan grade.
- Persistent clipping was not reproduced in the checked positions. Largest-text Again/Hard still need direct visual inspection; B12.5-C remains open.

## Verified tablet software-keyboard behavior

Device → Keyboard → Toggle Software Keyboard exposed the native keyboard with keyboard capture off. Individual software-key touches entered `Buenos dias`; no hardware typing or pasted answer was used. See [default keyboard](tablet-keyboard-default-es.png).

Changing native text size from default (3) to largest (11) preserved the draft. The layout remount dropped focus and hid the keyboard; tapping the input reopened it. At largest text the input stayed visible, while only the upper portion of Check Answer was above the keyboard. An upward content drag dismissed the keyboard and exposed the full Check, Hint and End controls. See [largest keyboard](tablet-keyboard-largest-es.png). This proves the dismissal/scroll route, not full-button visibility with the keyboard open.

Checking the ASCII answer produced “Revisa las tildes” and the model answer `Buenos días`. A cold terminate/launch returned to Home; Continue My Daily Plan reopened the same saved accent feedback. Touch scrolling exposed Retry, Continue With Help and End. See [cold-resumed feedback](tablet-feedback-cold-resume.png).

Continue With Help completed the same plan and mission, then a coordinate touch returned to Home showing completed-plan copy and daily count 4/5. See [largest completion](tablet-completed-largest-es.png). Completion was assisted; this is not evidence of correct accented software-key entry or language proficiency.

## State invariants

[Read-only snapshots](native-state-check.json) record all checkpoints. Tablet plan `mvchkn68-1-gss876oli3j`, review session `mvchkn68-2-ig7pwq6nwt`, mission run `mvchkn68-3-bcvwvdzln0v`.

Fresh review graded cards 1802 and 1803, moving counters 2/5→4/5 and events 3→5. Checking the answer added exactly one incorrect, answer-checked production event (5→6), without increasing daily/new counters. Cold resume and assisted completion preserved all six events, daily/new counts 4/4, 1,392 cards and the same deck hash. Mission revision progressed 0→1 (accent feedback)→2 (completed); plan phase progressed applied→complete. Completion and Home snapshots agree.

## Scope still open

- Largest-text Again/Hard labels and broader safe-area matrix on narrow Study.
- Full-button visibility while the tablet software keyboard remains open, accent-popup entry and remaining iOS matrix cases.
- Android acceptance, signed notification entitlements, physical-device and human language acceptance remain separate work. The unsigned client's notification keychain banner was dismissed for UI checks, not fixed or counted as notification validation.

Validation: parsed native snapshots and asserted narrow exactly-once grading, tablet feedback persistence, no duplicate events/counters, deck-hash stability and completed phase. Documentation/JSON formatting and git whitespace checks are required before integration. No product test suite was rerun for this evidence-only package.
