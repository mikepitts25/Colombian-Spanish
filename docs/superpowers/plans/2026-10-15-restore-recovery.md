# Restore recovery implementation plan

> Use superpowers:executing-plans for inline implementation and independent final review.

Goal: recover a two-key deck/history restore after interruption.
Architecture: serialized storage facade and durable after-image journal; backup restore locks learning-history mutation and commits both values through that coordinator.
Spec: `docs/superpowers/specs/2026-10-15-restore-recovery.md`.
Global constraints: no dependency upgrades, no destructive reset, legacy backup support, no hardware durability claim.
Review focus: journal-write failure; partial application; cleanup failure; corrupt journal; concurrent event append.

## Task 1 — Storage coordinator

- [x] Add failure-injection tests for journal-before-data ordering, replay before reads, failure before journal leaves existing data, cleanup failure replays idempotently, corrupt/duplicate/unknown journal keys fail closed, serialized operations.
- [x] Add `src/storage/durableStorage.ts`: default getItem/setItem facade and `withStorageTransaction<T>(operation)` with buffered getItem/setItem access. Only journal allowed existing app keys. Recover before any operation; serialize process-local work. Route all production AsyncStorage access through it.
- [x] Verify targeted storage tests and typecheck.

## Task 2 — Restore integration

- [x] Add real persistence tests for restore failure/replay, legacy/history merge, ID conflicts, append ordering and bounded events.
- [x] Expose `restoreBackup(decks, learningEvents?)` through storage using the history serialization queue and transaction-local access; replace Settings' separate history/deck writes. Update existing component tests to observe the restore boundary.
- [x] Add localized copy explaining durable retry/restart, without claiming immediate success on a failed write.
- [x] Verify full suite, types/lint/format/data/inventory; record simulator constraint or evidence.

## Task 3 — Review and integrate

- [x] Independent review; fix proven issues with regression tests.
- [x] Update master checklist with exact scope and remaining file/device work.
- [ ] Commit, merge and push under standing user authorization; verify CI and record result.
