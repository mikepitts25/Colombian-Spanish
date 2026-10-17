# Durable daily plan contract — 2026-10-17

## Scope

B05.3-B2a adds the persistent contract needed by the remaining two-phase daily-plan flow. It does not expose the new plan from Home or execute/complete an applied activity yet. B05.3/B05.3-B/B05.3-B2 and the UI/timing subpackage remain open.

The focused [spec](../../superpowers/specs/2026-10-17-durable-daily-plan.md) and [implementation plan](../../superpowers/plans/2026-10-17-durable-daily-plan.md) define the contract and follow-on integration. No server, dependency, editorial acceptance or production feature flag changed.

## Behavior

A strict version-1 envelope holds one current plan with local day, three/five/ten-minute preference, immutable start identity, exact original/remaining review IDs and optional versioned applied/run identity. Missing storage is empty; corrupt/unknown data is retained and surfaced. A repeated identical start returns current progress. Reused IDs with changed definition fail. Unfinished plans survive competing starts and day/preference changes; only completed work may be replaced by a fresh identity.

Optional `AnswerAttempt.planId` links a grade to its plan. The existing journal now validates the current phase/card, actual stored deck, review session, exact next suffix, region and limits before saving plan advancement together with grade schedule, daily counters, seen words, event and normal resume pointer. The final review card moves to applied or complete for review-only plans. Unlinked practice stays independent. Retained grade retries neither double-count nor advance replacement plans. Linked learning events retain their plan identity; old events/callers remain unchanged.

Full-state version-3 backups include optional dailyPlan. Old full-state backups without that field reset plans to empty. Deck-only imports preserve the local plan. Malformed plan state is rejected before restore writes; history still follows existing merge/deduplication rules.

## Verification and decisions

- New contract tests cover missing/corrupt state; strict phase/date/queue validation; copied queued input; competing starts; immutable ID conflicts and replay after progress; exact review/applied/review-only transitions; stale plan/card/session/region/limit/suffix; manual-grade independence; replay against replacement plans; concurrent first-card attempts; applied-only starts; partial-write recovery; coherent capture/parse/restore, legacy reset and deck-only preservation.
- A concrete moved-card regression failed, then passed after checking the actual stored deck before linked grading.
- Full-suite backup fixture now expects the explicit empty daily-plan envelope after legacy state recovery.
- Full-suite execution also exposed an existing Study test synchronization race. The test waited for a static section heading rather than the asynchronously loaded Continue control. It now waits for the actionable control; no product Study behavior changed.
- Fresh independent whole-branch review found **no actionable findings** within this contract scope. Reviewer independently passed 29 tests across dailyPlans and existing flashcardAnswer suites.

Ruling: retain initial card IDs separately from the exact remaining suffix — this makes identical start retries recognizable after progress and rejects reusing an ID for different source content. Cost: a second bounded list of at most 15 IDs.

Ruling: optional planId on retained learning events — required to reject conflicting linked/unlinked grade replays; absent historical identities remain absent, without migration or invented evidence.

Ruling: no native phase claim — this package has no learner-facing phase UI. The available Device Hub attempt reported the Mac locked; no simulator settings/data were changed. Automated transaction/restore fixtures prove this storage contract, not complete multi-phase native acceptance.

## Final local checks

**84 suites / 842 tests passed**. Typecheck, zero-warning lint, formatting, 16 calendar-zone cases and data/editorial validation passed. Inventory remains 47 decks / 1392 cards / 1392 audio entries; all 1392 still await current human editorial acceptance.

## Follow-on work

B05.3-B2b must construct the plan from actual preference/budget/content availability, wire exact linked Study resume and direct applied handoff, preserve manual browsing, complete only the linked real applied run, calibrate activity-specific active duration, and capture restart/error/bilingual layout evidence. Draft authored content must remain development-gated pending real acceptance. Android runtime, signed builds, hardware and human learning/editorial evidence remain separate gates.

## Integration

Implementation `4ad3116` was fast-forward merged and pushed to main after the merged tree passed 84 suites / 842 tests. [GitHub Actions 39031868821](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031868821) passed all four quality/content, iOS/Android project-generation and production-JS-bundle, and summary jobs. [Checklist board deployment 39031868713](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031868713) passed. This contract package does not establish whole-plan native UI or Android runtime/hardware acceptance.
