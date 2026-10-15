# Atomic deck edit acceptance

October 15, 2026. Base `8a889d8`. B02.4-B2a, a bounded subset of the broader session/mutation audit.

## Reproduced defects and changes

Independent deck reads/writes let an overlapping add restore an old deck name, an overlapping rename erase a newly committed grade, and simultaneous favorite toggles collapse into one. Controlled regressions reproduced those failures before the fix.

`mutateDecks` now reads fresh stored decks, validates them, applies the edit, validates the result and writes through the existing durable journal in one serialized operation. Deck add/upsert/delete/rename/reset, provider favorite/flag/review edits, clear flags and startup seed merging use this boundary. It shares the coordinator with grading and backup restore without introducing another lock. Grade/history lock ordering is unchanged.

Malformed stored decks are rejected and retained rather than converted into an empty library. Startup merge/write failures show the existing bilingual recovery/retry view; a retry replays a pending intent before merging. Provider editor state changes follow a successful commit. Explicit edit semantics remain: reset intentionally resets SRS and deletion intentionally removes the selected deck.

## Verification

Baseline: 48 suites / 489 tests. Final: **49 suites / 496 tests passed**, plus types, lint, formatting, data validation and unchanged deterministic inventory (47 decks / 1,392 cards / 1,392 audio entries). New regressions cover concurrent rename/add, grade/rename, favorite toggles, simultaneous grade/flag/review patch, corrupt data preservation, interrupted edit replay and startup failure/retry. Startup recovery tests failed before the error handling was added. Independent read-only review found no actionable correctness or lock-order findings; 29 targeted tests independently passed.

## iOS simulator

The dedicated iPhone 16 Pro / iOS 26.0 QA simulator loaded this working-tree bundle in Expo Go 54.0.7. Startup retained prior 2/5 daily progress and eight new cards available. Favoriting card 1852 changed its accessible action to Remove from favorites; a Good grade advanced the queue from eight to seven remaining. Read-only persisted storage confirmed favorite true, reps one and one-day interval, eight total learning events and no pending journal. After terminating/reopening Expo Go, Home showed 3/5 and seven new cards available; post-startup storage inspection confirmed seed merging preserved both the favorite and grade. [Restart screenshot](01-restarted.png).

This checks the normal native flow. Automated tests provide controlled overlap and failure evidence; no physical or native storage-failure acceptance is claimed.

## Limits

This addresses deck persistence ordering, not full-queue resume or all application concurrency. Preference and standalone counter/history helpers still have separate mutation paths. A later explicit reset/delete/replace can intentionally supersede prior grades. General stale UI refresh responses and repeated editor actions after an uncertain post-journal failure need separate UX/idempotency work; unlike grading attempts, favorite toggles have no stable retry receipt. Native low-storage/process interruption and physical durability remain open. No new content review or mastery evidence is claimed.
