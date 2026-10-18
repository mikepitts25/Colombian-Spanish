# Removed displayed target: retain imported queue and recovery

Follow-up to PR29/B02.4-B2u. The prior repair rejected changed/moved meanings and queues, but a missing target still returned a successful no-op before context validation. This is safe for a legacy context-free transaction call; it is unsafe for a still-mounted grading screen.

## Reproduction

The existing real Study/provider/full-state restore fixture showed an old `first` card while restore removed it and imported the exact queue `[restored-next]` with session ID `restore-before-grade-session`. Submitting the stale grade recorded no credit and did not immediately write storage. However, the UI locally advanced to `second`, treated that old remainder as its resume pointer, and allowed Back → Continue. That normal checkpoint replaced the imported card ID, complete queue and session ID. The RED assertion compared all nine imported portable records and failed on the overwritten lastSession; it did not rely on an absent UI label.

Two direct transaction cases additionally failed before the fix: removing only the target card or its whole deck resolved as undefined instead of rejecting the new displayed answer. A separate Difficult Words regression found that publishing a removed card during a failed reload hid both the stale error and reload action behind the empty-state view. The test explicitly rerenders the mocked provider's changed deck snapshot, matching a real provider emission; the first draft without that emission failed before reaching the intended invariant and is not the final bug proof.

## Repair and scope

A new answer carrying displayed context now raises the existing StaleGradeError if its card/deck is absent. The matching prior-event acknowledgement remains first, so committed answers whose target later disappears are still acknowledged exactly once. Context-free legacy unknown-card calls retain their no-op behavior.

Study uses the existing bilingual stale recovery, blocks Back/swipe/grade rather than installing a local stale remainder, and reloads the imported queue. Held/interrupted removed-card cases assert no credit, all imported records unchanged, disabled Back, no stale Continue route, failed-read recovery and exact imported React remount/resume. Capped-card controls remain daily-cap errors.

Difficult Words renders its existing stale error/reload action even when the reloaded queue has no current card. A failed budget read therefore remains recoverable; successful retry can then show the normal empty state. No new copy, palette, dependency, durable key or schema. Classic and Barrio share the correction.

## Verification

- Original real Study Back → Continue invariant: RED on exact imported card/queue/session ID.
- Two missing-target transaction cases: RED (resolved undefined rather than stale rejection), then GREEN.
- Difficult Words provider-emission case: RED (stale alert/reload hidden), then GREEN.
- Focused five-suite run: 71/71, including existing committed/missing-target retry, legacy no-op, metadata, editorial, cap and theme-audit controls.
- Final full suite: 117/117 suites and 1,151/1,151 tests, with zero React act diagnostics. Types, lint, formatting, the theme audit (255 classified literals, 418 contrast pairs, zero errors) and diff checks pass; independent final review found no Critical, Important or Minor issues. Results are recorded in `verification.json`. An earlier full run overlapped addition of the new RED Difficult Words test and failed on that intended regression; it is not the final verification.

## Acceptance limits

Automated React/provider/storage and React remount evidence only. No simulator UI action, native process-death, physical-device or release acceptance is claimed. The current Device Hub observation timed out; simulator checks remain in their existing named bundles. Audio design approval, Android agreement, editorial/rights/account/signed/device gates remain distinct. Security remains skipped.
