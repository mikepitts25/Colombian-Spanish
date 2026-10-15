# Transactional grading plan

> Execute inline with superpowers:executing-plans and one independent branch review.

Spec: `docs/superpowers/specs/2026-10-15-transactional-grading.md`. Use existing storage journal; no new dependencies or irreversible migration.

- [x] Add real-storage regressions: schedule/counters/history/session commit, repeated/conflicting attempts, failed write/recovery/retry, concurrent new-card cap, preserved current deck edits.
- [x] Allow storage helper functions to use a transaction-local StorageAccess; add flashcardAnswer module and provider integration with post-commit state updates.
- [x] Add Study/Difficult save-error retry tests; keep stable attempt IDs and grades, remove separate daily increments, guard rapid submission and freeze Difficult queue membership.
- [x] Full tests/types/lint/format/data/inventory; independent review/fixes; exact checklist and QA evidence; merge/push and verify CI. Keep full-queue resume/device gates open.
