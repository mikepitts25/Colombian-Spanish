# Study session boundary audit

Base: c4a5b88. Continue B02.4-B2 without changing grading semantics or creating a new product flow. Reuse the existing isolated worktree and SDK57 simulator build.

## Contract

An external active-deck change must own a new session identity and queue. An earlier grade may settle its original durable intent, but cannot replace the new screen, display its failure there, reuse its retry, or overwrite the newer saved checkpoint. Ordinary grade/provider updates, same-region taps and explicit bounded resume must keep exact membership and identity. Retained card edits are reflected without adding cards to an open queue.

## Tasks

- [x] Baseline StudyScreen45 tests pass; reproduce external-deck-switch/late-grade failure in a controlled test. Observed: new celular disappears when prior hola grade resolves.
- [x] Pin success/failure, delayed checkpoint ordering, old checkpoint completion and new identity/limits cases. Fix only the demonstrated session ownership and ordering failures; retain exact queues.
- [x] Run full/static/calendar/content checks and applicable native navigation/resume checks. Capture actual boundaries; do not claim deterministic native race injection if only unit tests exercised it.
- [ ] One fresh whole-package review, RED→GREEN fixes, final checks; update master checklist/QA, merge/push and observe CI under standing authorization.

## Investigation

The queue effect runs for an external activeDeck.id change, but only explicit startSession/changeRegion advance sessionVersion. The prior grade consequently passes its stale guard and writes old IDs into the new screen. Checkpoint writes use durableStorage while grading first queues through the learning-history serializer; a new checkpoint must await the original grade settling to preserve intent order across both coordinators.

Implementation direction: track queue deck ownership outside render, invalidate old UI/retry state at external boundaries, and gate new checkpoints behind the active grade's settled promise. A new external deck uses ordinary limits and a fresh learning identity; explicit starts/resumes still supply their own settings. Keep the selected region. Missing/empty decks must also invalidate the old owner.

Ruling: this is a correction of the existing session/backup invariants already authorized in B02, not a new feature or a new publication decision. Complete required fixes and merge under the user's standing instruction; keep hardware/editorial gates open.

Task2 result: three observed RED failures (late-grade UI, premature checkpoint, unmounted deferred checkpoint), then51 StudyScreen tests GREEN; full79/777, types/lint/calendar16/content GREEN. Fixed queue owner/generation, grade-settled barrier and disposal invalidation. Additional tests cover failure/retry isolation, latest boundary and bounded identity/limits. Native old-bundle evidence exposed inherited identity/limits; corrected-bundle rerun passed: fresh Business identity, nine cards without inherited limits, exact cold resume; daily/events/library totals unchanged.

Final review: one fresh independent whole-package reviewer reported no actionable findings. Integration remains pending.
