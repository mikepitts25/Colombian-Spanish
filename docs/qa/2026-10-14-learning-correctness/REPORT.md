# Learning correctness — second AI batch

Date: October 14, 2026. Base: `da9dcc0`. Scope is defined in [the batch plan](../../superpowers/plans/2026-10-14-learning-correctness.md).

## Delivered changes

- Normal and compact conjugation buttons now open the same real dialog. Separate tú/vos rows prevent missing tuteo data from being replaced by voseo. Missing forms are localized as not included; labels include usted and third-person plural. No additional linguistic acceptance is claimed.
- New `SRS_LEARNING_EVENTS_V1` storage keeps a schema-versioned envelope and event identities, card/deck/session IDs, optional mission ID, modality, outcome, evidence source, timestamp, and nullable hints/duration. No legacy scheduling counters are converted into observations.
- Writes are serialized, retries with an identical retained ID do not duplicate events, conflicting reuse is rejected, and corrupt/unsupported history is not overwritten. Public reads wait for writes already queued when the read began. Retention is the most recent 5,000 timestamped observations across modalities; deduplication is guaranteed for IDs still retained, not an unlimited historical ledger.
- Quizzes record checked recognition instead of calling the flashcard scheduler. Quiz answers no longer increment the flashcard daily review counter; they still record study-day participation. Stable prompt IDs survive save retries within a session, and completion uses a stable session ID to avoid duplicate summaries.
- Feedback follows successful persistence, with retry controls on failure and an explicit next/results button instead of an automatic timeout. Current translations replace stale seen-word English. Meaning text is normalized/deduplicated before sampling; a pool with no distinct distractor cannot create a scored question. Semantic distractor quality remains an editorial/B04 task.
- Backup version 2 includes learning events. Legacy version 1 (including omitted version for compatibility) remains importable. Invalid/unsupported event data is rejected before import; observations are merged by identity without erasing existing history. A conflict prevents deck replacement. Export/restore failures have localized error feedback.
- Progress replaces the mastered-by-repetitions metric with due reviews, separates checked recognition results from scheduling coverage, excludes new cards from due reviews, and shows an unavailable state when history cannot be read. It does not claim measured recall, listening, speaking, or fluency.
- Home and Progress refresh on focus, foreground, and local-date rollover checks; subscriptions/timers are cleaned up and older asynchronous responses cannot replace newer results. Home's day boundary, greeting, and word of day refresh with the new snapshot.

## Verification

- Full Jest suite: **40 suites / 372 tests passed**.
- TypeScript, ESLint, formatting, data validation, inventory regeneration consistency, and `git diff --check` passed locally.
- The existing 47 decks / 1,392 cards / 1,392 pronunciation mappings remain valid; the generated editorial inventory is unchanged.
- Production Hermes JavaScript exports passed for both iOS and Android. This is not native compilation, signing, simulator interaction, or hardware acceptance.
- Targeted regressions covered compact/normal modal opening and pronoun isolation, concurrent event writes and retries, conflicting IDs, failed writes, corrupt/future-version history, 5,000-event pruning, backup compatibility, unchanged card schedules after quiz answers, correct/incorrect recognition, completion retry, duplicate meanings, unusable answer pools, foreground/focus/midnight refresh, stale asynchronous reads, and listener cleanup.
- Independent review identified duplicate answer text as a P2. New tests failed before the fix, then passed. Follow-up review confirmed the fix and queued-write read ordering; 28 focused tests were independently rerun with no remaining blockers.

## Explicit limits and next work

- Flashcard grades retain their existing scheduling implementation and are not yet logged as new recall observations. Transactional grading, stable study queues, rapid-grading safety, cross-deck resumption, and daily-counter races remain B02.3/B02.4 work.
- Listening, speaking, and mission-only observations have no implemented producer in this batch. The data contract provides modalities and optional mission association; future features must supply honest evidence rather than backfilling it from quiz results.
- Timing is elapsed wall-clock time from presenting a quiz prompt to the first answer submission; it includes pauses/background time and is not a fluency score.
- Backup event merging and deck replacement are separate writes, not an atomic multi-key restore. File-based backup, complete preferences/streak backup, and crash-safe full restore remain B11. Existing decks are not erased when history validation/conflict fails; a later deck-write error can leave imported observations merged.
- Full timezone/DST transitions, empty/returning-user native flows, actual simulator interaction, physical-device behavior, native grammar/audio acceptance, and learner effectiveness are still open.
- The separate pre-existing Kanban Pages deployment remains B01.9; this batch does not enable publishing.

## Integration evidence

Functional commit `e6bbc56` was fast-forward merged and pushed to `main`. [CI run 38528081242](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38528081242) passed all quality/content checks and iOS/Android project generation and production JS bundle jobs on Linux/Node 22. The merged main checkout also passed all 372 tests, types, lint, formatting, and data checks locally. Evidence is also recorded in the master plan work log. The batch is not a claim that all B02 or release work is complete.
