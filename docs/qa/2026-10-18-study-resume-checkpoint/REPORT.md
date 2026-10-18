# Atomic ownership check for resumed Study checkpoints

Baseline PR31/main `d6271f3`. This closes a shared checkpoint gap after a restore, without changing grade acknowledgement or daily-cap behavior.

## RED reproduction

Two real Study/provider/full-state restore flows retained all imported records immediately after grading but lost the imported remaining queue on normal Back → Continue:

- Restore changed the saved queue while retaining a new displayed card and exhausting the daily new allowance. The grade correctly returned the cap error. Continue later replaced imported `[restored-next]` with old `[first, second]` and its old session identity.
- An interrupted grade had already been committed before restore edited the target and imported a different queue. Original Retry correctly acknowledged the existing event once. Continue later replaced the imported queue with the local post-grade `[second]` queue.

Both RED assertions compared the complete imported portable records and failed on exact lastSession card IDs, queue and session identity. Neither grade created a duplicate event. The missing safeguard was the later checkpoint write, so changing cap priority or rejecting an already-committed answer would not repair the shared boundary.

## Repair

When Continue selects a saved session, Study retains a copied expectation of its complete original pointer/queue. `saveResumedStudySession` copies both inputs, reads the current saved session inside the same durable transaction used to write the checkpoint, and compares deck/head, full ordered IDs, region, session identity and limits. A missing/replaced session is rejected before this checkpoint writes. If journal recovery already applied the exact intended filtered remainder, Retry acknowledges that stored after-image without rewriting it or refreshing its later timestamp. Timestamp-only refresh is allowed; unavailable members may still be filtered from the selected saved queue.

A stale checkpoint releases its pending intent and uses the existing bilingual stale reload recovery. New session/deck/region intents retain their existing behavior. Failed ordinary saves retain the original expected session for Retry; they do not silently adopt a newer imported queue. Version/unmount guards continue to discard superseded work. Explicit plan opening remains a separate intent: it has just validated its durable plan session and can replace an unrelated ordinary checkpoint. Ordinary Continue still validates the selected global checkpoint, including Continue from a linked plan. No key, schema, dependency, copy or palette was added.

The integration cases now verify imported state stays exact through rejected stale Continue, read-only reload and correct imported React remount/resume. The prior grade event stays unique, and the cap control remains a cap error. Four storage cases pin replaced/deleted sessions, recovered filtered-checkpoint acknowledgement and the valid filtered resume, with a deliberately different stored timestamp. The Study unit adapter delegates the new mocked storage entry point to its existing save mock, preserving held/error/navigation assertions; the screen explicitly supplies its selected saved snapshot as the expectation.

## Verification and limits

Two end-to-end queue invariants were RED before repair; three new storage-contract cases were RED before their entry point existed; the recovered filtered-checkpoint case additionally failed as stale before the after-image acknowledgement was added. Initial broad checks exposed outdated screen mocks for the new entry point and a typo in an added expected queue assertion; these were test-adapter issues, corrected without changing product behavior. Independent final review found one Important regression: a freshly created plan has no matching global checkpoint, so applying the ordinary Continue expectation blocked its first opening. Two real-provider/storage tests reproduced first opening and returning after manual Study; the explicit intent distinction fixes both. A control in the latter test still rejects ordinary Continue when another session replaces its linked plan checkpoint, preserving all durable payloads. Final focused run: 117/117 cases. Final full run after the fix pass: 117/117 suites and 1,157/1,157 tests, zero React act diagnostics. Types, lint, formatting, theme audit (255 classified literals, 418 contrast pairs, zero errors) and diff checks pass. No Critical or Minor findings, and the one Important finding is fixed with RED→GREEN tests; no re-review or deferred minors. Results are recorded in `verification.json`.

This is automated React/provider/durable-storage and React remount evidence. It does not close native process-death, physical/signed, broader ordering or simulator touch/keyboard/calendar requirements. Simulator UI access last timed out; no native interaction or direct storage write occurred. Audio written-spec approval remains pending, Android agreement and real content/rights gates remain separate, and blocked security remains skipped.
