# Recoverable backup restore

October 15, 2026. Base `da9d436`. Scope B11.2-B1: existing clipboard restore and shared local-storage recovery.

## Behavior

All production application AsyncStorage access now passes one process-local serialized coordinator. Before serving a read or write it replays any saved version-1 after-image journal. Every journal entry is checked before replay; malformed/unknown versions, duplicate keys, unsupported keys and nonstring values fail closed without discarding the journal.

Restore validates and snapshots incoming decks, serializes against learning-history append/merge, validates current history and conflicts, merges with the existing 5,000-event bound, then buffers deck/history replacements. It saves the intent before either data key, applies absolute values, and deletes the journal only after both writes finish. Failed application/cleanup leaves an idempotently replayable intent. Failure before journal save leaves prior data unchanged. Legacy restores replace decks without replacing history.

Startup holds deck/language providers behind a recovery gate, so providers cannot seed or merge partially restored storage. Recovery failure shows bilingual retry guidance without resetting data. Settings describes the conditional retry/restart behavior when restore cannot finish.

## Verification

Baseline 41 suites / 419 tests passed. Final full suite: **44 suites / 438 tests passed**, plus TypeScript, ESLint, Prettier, data validation, deterministic editorial inventory comparison and diff whitespace checks. Inventory unchanged: 47 decks / 1,392 cards / 1,392 audio mappings.

New failure-injection coverage verifies write ordering, journal preparation failure, second-key failure, cleanup failure, persisted-journal replay without an in-memory transaction, malformed journals, buffered reads, rejected callbacks, serialized later writes, history preservation/conflicts, concurrent restore/append and startup failure/retry. The persisted-journal test was also run with recovery temporarily disabled: it failed expecting restored data but receiving null, then passed after recovery was restored. No regression toggle remains in production.

Independent review found no actionable findings and independently reran all 19 new tests across three suites. Implementation `80a2982` was merged and pushed to main. [GitHub Actions run 38679345816](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38679345816) passed all quality/content and iOS/Android project generation and production JS bundle jobs; these do not establish native compilation or hardware acceptance.

## Limits

This is recoverable roll-forward intent, not native multi-key atomicity or measured hardware durability. A journal saved before a failure may complete on retry/restart. General grading/counter read-modify-write transactions, exact queue resume, and live provider refresh after restore remain separate work. Existing restore UI advises restarting if needed.

No storage keys were migrated, no backup formats changed, no data was reset. File export/import, complete preferences/streak/seen-word backup, migration recovery for those future formats, and physical file/share/reinstall tests remain open. Simulator UI was unavailable because the Mac was locked; no new interactive acceptance is claimed. Automated restart simulation does not establish OS kill or physical low-storage behavior.
