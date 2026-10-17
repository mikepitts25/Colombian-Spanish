# Focused due-count refresh

Base 5ff0925; master B02.6. Existing purpose: Home and Progress show reviews due now and recover on focus/foreground/local-date changes. Current minute timer only refreshes when toDateString changes, so an already mounted screen can hide a review becoming due later the same day.

## Contract and scope

Refresh focused, active screens once per minute as well as on focus and foreground. Preserve latest-request ownership, last-good values on error, cleanup and explicit recovery. Avoid interval reads while inactive/background; foreground triggers the catch-up read. No scheduling, counters, schemas, dependencies or new product flow changes. Full timezone/fresh/empty/upgrade/physical acceptance remains open.

## Tasks

1. Reuse isolated worktree and pass baseline. Reproduce same-day due-count drift in Home/Progress with controlled clock and consumer-visible assertions. Expected: due count becomes one at the first minute tick after the due time; old code stays zero (RED).
2. Correct existing focused refresh timer; cover background suspension, foreground catch-up and stale late result. Expected: targeted tests GREEN, full suite and static/calendar/content checks pass.
3. Verify applicable iOS navigation/foreground and retained state, clearly separating native checks from controlled timing tests. One fresh whole-package review, final verification, update master/QA, merge and push under standing authorization; observe CI.

## Review focus

Check native AppState null/active/inactive/background startup semantics, timer/foreground overlap, late success and failure, unmount/focus cleanup, and consumer due-time calculations. Avoid claiming native timezone or clock injection without evidence.

Ruling: this is a bounded correction of the existing due-now refresh contract already authorized in B02.6, not a new feature; proceed without another design approval. Cost if wrong: a minute read while focused, bounded to local storage. Original same-day bug must be reproduced before changing code.

## Results

- [x] Baseline relevant 29 tests; two visible due-count regressions and late-minute request RED observed.
- [x] Minimal shared timer correction; targeted 8 pass, full80/781, calendar16, types/lint/format/content checks pass. Existing unrelated act warnings retained and documented.
- [x] Fresh iOS27 bundle, retained queue, one normal grade, Home/Progress and background-return totals verified; read-only state/screenshots saved.
- [x] One independent review: no Critical/Important findings. Minor deferred: explicit native startup AppState fixtures.
- [ ] Merge/push and remote CI acceptance.

Review rulings: native timezone/clock injection, Android/signed/physical, and full fresh/empty/returning/upgrade matrix remain open. Controlled timing and the targeted native run do not establish those behaviors; the cost is unverified edge cases/platforms, not claimed acceptance.
