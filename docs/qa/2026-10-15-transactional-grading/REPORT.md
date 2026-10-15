# Recoverable flashcard grading

October 15, 2026. Base `3f55dbf`. Scope B02.3-B1 / B02.4-B1.

## Delivered behavior

A grade reads current persisted decks and fresh daily budget inside the storage coordinator, then commits its SRS update, daily total/new-card count, seen-word result, streak, self-rated recall event and optional next-card resume pointer through the durable after-image journal. Provider state updates only after successful commit. This avoids grading from an old provider snapshot and prevents a failed initial journal save from optimistically advancing provider state.

Self-rated observations include quality, explicit recall modality and self-rated evidence; hint/duration fields remain null rather than invented. The optional quality field is backward compatible with existing schema-1 observations and version-2 backups. A self-rating is not measured unaided recall; Progress recognition results still filter recognition events only.

Stable attempt IDs are deduplicated within the retained 5,000-event history; conflicting card/session/quality reuse fails. Absolute journal replay finishes an interrupted commit before subsequent reads. Concurrent fresh-card attempts check the same daily cap at commit time. This is bounded retry safety, not an unbounded permanent receipt ledger.

Study and Difficult practice keep the original attempt/quality through a save failure, show a retryable error and no longer write a second daily counter. Study blocks local back/region/new-session changes while a grade is unresolved. A daily-limit rejection permits browsing again. Difficult practice freezes queue membership so cards do not disappear before the index advances, and guards overlapping submissions.

## Verification

Baseline: 45 suites / 453 tests. New storage tests cover full effect persistence, duplicate/conflicting attempts, partial-failure recovery/retry, concurrent cap enforcement, preservation of current stored edits, and unknown-card no-op behavior. Screen failure/retry and unresolved session-boundary regressions failed before their fixes. Additional regressions cover provider state on journal-save failure and Difficult eligibility changes. Independent review found no actionable storage/lock-order bugs and accepted the final boundary guards.

**46 suites / 464 tests passed**, plus TypeScript, ESLint, Prettier, data validation, unchanged deterministic editorial inventory and diff checks. Inventory remains 47 decks / 1,392 cards / 1,392 audio mappings. Implementation `1a329d6` passed [GitHub Actions run 38681070946](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38681070946), including quality and iOS/Android project generation/production JavaScript bundles.

## Remaining limits

Exact full-queue restoration and persistent in-flight UI attempt restoration are not implemented. Deduplication requires callers to retain attempt identity, and expires when its event leaves retained history. Other editors still have separate read/modify/write operations, so unrelated simultaneous mutation races remain open. Difficult practice retains its existing early-review behavior; scheduler redesign/relearning acceptance is not claimed. External navigation/termination, real low-storage interruption, broad timezone cases and physical durability need separate acceptance.

## Follow-up iOS simulator acceptance

After the Mac was unlocked, the file-backup batch exercised this grading path in Expo Go 54.0.7 on the dedicated iPhone 16 Pro / iOS 26.0 QA simulator. One Good grade advanced the queue from nine to eight remaining, daily count from 1/5 to 2/5, and new-card allowance from nine to eight. Terminating Expo Go and reopening the app preserved 2/5, eight new cards available and streak two. Read-only local storage inspection found seven events (previously six), latest recall/self-rated/quality 4 with null hint/duration, and no pending journal. Screenshots: [after grade](01-after-grade.png), [after restart](02-restarted.png). This is successful-save/restart acceptance; storage failure injection remains automated and physical/OS interruption remains open.
