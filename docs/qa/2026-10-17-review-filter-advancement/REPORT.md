# Filtered editorial advancement — 2026-10-17

Base `a40d382`. B02.4-B2g fixes an observed editor queue defect. Before the change, saving could remove the current card from a filtered list, after which `goNext()` incremented the index again and skipped the immediate successor. This affected Unreviewed, Flagged, Needs Native and Missing Example EN.

## Fix and regression evidence

Build the exact saved patch, persist it, then advance the index only when the patched card still matches the selected filter. When the card leaves the list, its successor already shifts into the same index. No scheduling, grading, storage, translation or release-acceptance rules changed.

Four tests mount the real ReviewScreen/DeckProvider/storage stack with three cards. Each selects an affected filter and saves the first card, expecting the second. All four [failed before the fix](targeted-red.log), displaying the third card. After correction, all four pass; two controls verify ordinary all-card advancement and a retained flagged row still advance. The existing Study/editor tests also remain green. [Focused result](targeted-green.log): 2 suites / 12 tests. [Full result](full-suite.log): **92 suites / 901 tests**. Typecheck, zero-warning lint and focused formatting passed. Fresh independent review reran all nine integration cases with no actionable findings.

## Native check

Existing unsigned SDK57 development client, Metro8098, dedicated iPhone SE3/iOS26 fixture `E66A88D6-CC87-4F46-A197-3F97EE9ED8CB`, Spanish/default text size. CUA UI actions only; own-app state was inspected read-only. No simulator storage was edited directly.

From the active ordinary Study session (`Hola 3`, seven remaining), navigated Settings → Manage Decks → Review Translations → Unreviewed. In the all-decks list, the first two rows were synthetic Catch-up QA cards. Successive normal Save & Next actions showed `Hola 0 → Hola 1 → Hola 2`; each save removed its current row while keeping index 1 in the shrinking list. [After two saves](native-unreviewed-after-two.png).

Returned through native back navigation and the Study tab: the same `Hola 3` and seven remaining were shown. Cold terminated/launched the app, opened Study and Continue, and again resumed `Hola 3` with seven remaining. [Cold-resumed Study](native-study-cold-resume.png).

[State checkpoints](native-state-check.json) assert unchanged daily3/5/new0, six exact learning events, linked daily-plan/mission state, preferences, streak, library count and exact ordinary queue/session identity at every phase. The seven IDs remain `catchup-3` through `catchup-9`. All ten synthetic cards retain their scheduling and content; only reviewStatus, reviewedAt and flagged metadata change for cards0/1. Those QA-only local review markers do not constitute human language acceptance or modify the repository editorial ledger. No grade was submitted during this check.

The unsigned client's known notification-keychain banner appeared after restart and was dismissed through its UI for capture. Signed notification behavior is not validated here.

## Still open

B02.4-B2h separately tracks editor pending-save, failure, rapid input/filter/back and draft recovery. The existing save function lacks explicit busy/error handling; this package does not claim those paths are safe. Broader OS/platform, large-text and physical acceptance remain separate. The goal remains active.
