# Atomic deck edits

Scope: bounded follow-up B02.4-B2a under the authorized master plan. The storage coordinator already serializes grades/restores, but individual deck editors still split read and write. Route seed merge, favorites, flags, review patches and deck CRUD through one coordinator operation that reads fresh decks and journals the resulting deck snapshot. Reject malformed current data rather than silently replacing it. Keep existing UI behavior and public APIs.

The alternative of a separate editor lock would not exclude grades/restores; reuse the existing durable transaction. A database migration is unnecessary for this bounded fix. No new event evidence or queue-resume claims.

- [x] Reproduce concurrent rename/add, favorite toggles, grade/edit preservation, corrupt-state preservation and save failure.
- [x] Introduce validated transaction-local deck mutation and route storage/provider editors and seed merge through it.
- [x] Run targeted/full checks and independent review; fix findings.
- [x] Record evidence and precise remaining limits in master plan, merge/push and verify CI.

Simulator acceptance is optional for unchanged UI interactions; concurrency/failure ordering needs controlled automated regressions. Physical interruption, complete queue restoration, stale UI refresh races, preference/counter writers and broader navigation remain separate work.
