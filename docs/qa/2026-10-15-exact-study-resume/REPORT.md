# Exact bounded study resume — 2026-10-15

## Delivered

B02.4-B2c: a versioned snapshot holds up to 15 ordered remaining card IDs, region and learning-session ID. Initial persistence must succeed before grading; failure offers retry. Each durable grade intent includes the next exact queue. Legacy pointer records remain readable, and version-3 backups validate and preserve snapshots. Resume drops missing, wrong-region or no-longer-eligible cards without adding newly eligible cards. Completed batches show a completion action and cannot resume an empty queue.

## Evidence

- 54 suites / 556 tests passed; typecheck, lint, formatting, data and editorial validation passed; regenerated editorial inventory unchanged.
- Tests cover exact order/identity, deletion, checkpoint failure and pending saves, final completion, region preservation, exclusion without refilling, malformed snapshots, backup roundtrip and interrupted-grade journal replay with deduplicated retry.
- Independent review identified a stale initial-read error concealing a newly saved checkpoint. The new regression failed before correction and passed afterward; follow-up review found no actionable issues.
- iOS 26.0 / dedicated iPhone 16 Pro simulator / Expo Go 54.0.7: seven-card Essentials queue IDs 1853–1859. After grading 1853, storage held the exact six-card suffix. Terminated Expo Go and reopened Metro 8098; Continue resumed 1854 with six remaining, same order, region `all` and session ID `mv9m4bav-2-m5eji17dt5`.
- Finished the remaining six grades. UI shows “Sesión terminada”, zero remaining and visible quiz action. Read-only storage inspection confirms empty queue, absent current-card pointer and the same session ID; daily count/newCount 10, 15 learning events, no pending journal. These are simulated QA answers, not learning outcomes.
- Screens: [after grade](01-after-grade.png), [resumed](02-resumed.png), [completed](03-completed.png).

## Limits

This does not establish physical-device durability, native compilation/signing, every external-navigation race or a complete Difficult/early-review policy. The initial checkpoint is a coordinated single-key write; multi-key grades use the existing recovery journal. Legacy timestamp records cannot reconstruct missing historical queues. No human editorial acceptance or audio quality claim is made.

Implementation `8b945db` was merged and pushed to main. [GitHub Actions run 38749492905](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38749492905) passed all quality/content checks and independent iOS/Android project generation and production JavaScript bundles. These do not constitute native compilation or physical-device acceptance.
