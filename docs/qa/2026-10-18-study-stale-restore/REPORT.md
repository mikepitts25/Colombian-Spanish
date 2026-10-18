# Stale, uncommitted grades after restore

Base: `34772b5` (main after PR28). Runtime repair for B02.4; Classic and Barrio use the same safe transaction.

## Reproduction and cause

The real Study screen/provider displayed `phrase first` while a full-state restore was held before journaling or interrupted after journaling. The imported record retained that card ID but changed its meaning or moved it to another deck. The old screen then submitted a new answer. All four new cases recorded learning credit against the replacement card, changed its schedule and overwrote the imported remaining queue. Four existing removed-card/daily-cap controls passed. The invariant assertion expected no new learning events and failed with a new self-rated recall event in every edited/moved case.

The grade transaction correctly read fresh decks, but looked up the target by ID alone. It had no record of the meaning or queue on which the answer was based. Already-journaled retries are a separate case: PR27 correctly acknowledges those original events without regrading.

## Repair

Both Study and Difficult Words retain an ephemeral context with the original answer intent: source deck, displayed front/back/example, and, for Study, the original complete ordered queue, region, session ID and limits. Inputs are copied before asynchronous waits. Inside the durable transaction, an already-recorded matching event is acknowledged first. A new answer must match its displayed meaning/source and Study queue before any learning writes. Scheduling, editorial status, flags, deck names and checkpoint timestamps alone do not invalidate meaning.

A mismatch produces a bilingual reload action. The uncommitted answer is discarded; neither Retry nor swipe can resubmit it. Reload only reads current decks/budget/session/plan, retains an error when a read fails, and returns Study to its landing screen on success. The imported queue is then resumed through the normal existing path. Difficult Words resets its queue from the reloaded cards. No storage key, durable schema, dependency or content release changed. Legacy direct transaction callers without a context retain their existing behavior; both production grading screens provide context. Existing missing-card no-op and fresh daily-cap behavior remain covered.

Concurrent editor changes to the displayed answer also invalidate a waiting grade. The editor integration now asserts zero credit and unchanged remaining queue before reload, then submits a fresh answer against the corrected meaning; it retains the original scheduling/edit/queue/remount assertions. This intentionally replaces the old acceptance of an answer based on superseded text.

## Verification

- Original restore reproduction: four expected invariant failures, four existing controls passing.
- First focused corrected runtime: 50/50 cases passing.
- Extended focused run: 67/67 across five suites, including restored queue with unchanged meaning/session ID, metadata/scheduling control and recovery after failed reads.
- Swipe regression: the recovery test first failed with two provider submissions instead of one; the explicit stale-state guard makes it pass.
- Study held/edited restore additionally fails the first reload preference read, verifies the reload action remains usable, grades remain disabled, and the complete imported backup remains unchanged before successful retry.
- Independent final review found one Important recovery checkpoint race when restore removed the original deck. The added replaced-deck regression failed on the exact imported session ID/timestamp invariant; suppressing session-boundary checkpoint creation while stale recovery is active fixes it, including failed reload and the successful transition to landing. No Critical or Minor findings.
- Final full suite: 117/117 suites and 1,148/1,148 tests, with zero React act diagnostics. Final focused fix pass: 68/68. Types, lint, formatting, theme audit (255 classified literals, 418 contrast pairs, zero errors), 14 Python evidence helpers, 16 calendar cases, data validation and diff checks pass. Results are recorded in `verification.json`.

## Limits

This is automated React/provider/storage acceptance, including remount, not native process-death or physical-device acceptance. No new simulator interaction or simulator data write occurred. Current CUA inventory sees Device Hub running, but the previously reported UI-read timeouts remain unresolved; inventory alone does not prove an unlocked or usable simulator window. Home phone/tablet touch, maximum-text and live calendar gaps remain open in their existing checklist rows. Blocked security remains skipped. This bundle does not close the whole B02.4 parent or Home Task4.
