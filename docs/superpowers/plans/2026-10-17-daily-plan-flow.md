# Daily Plan Flow Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans serially in the existing worktree. Obtain one fresh whole-branch review before merge.

**Goal:** Connect actual bounded review to one authored applied response with durable phase resume.

**Architecture:** Fresh storage inputs construct/resume a DailyPlan atomically. Home opens its next phase directly; Study links exact-queue grades, while a small applied screen reuses the existing mission engine/player and links its real run completion. Existing ordinary review remains the fallback when no applied content is available.

**Tech Stack:** Expo57/React Native/TypeScript/Jest, existing durable plan and mission contracts.

**Spec:** `docs/superpowers/specs/2026-10-17-durable-daily-plan.md`

## Global constraints

Draft authored language stays development-gated. Do not award learning proficiency or extra daily review counts for applied completion. Preserve exact IDs/limits, pending grade identity, unlinked browsing and old backups. Ending a plan is explicit and retains all graded progress/history. No server/new dependency.

## Review focus

- Concurrent Home starts must resume one persisted identity, using fresh deck/preferences/daily budget.
- Day/preference changes and recalibration cannot refill or replace unfinished queues.
- Pending grade/checkpoint or failed plan read cannot launch stale/unlinked practice.
- Production/unavailable/changed content cannot execute a draft applied phase or complete another run.
- Final applied commit and retry must atomically retain mission/event/plan completion once.

## Tasks

- [x] TDD: create one short response pack derived from the existing exact first-morning greeting, explicitly distinct from the full mission. Validate availability against actual card registry and development gate.
- [x] TDD: fresh atomic plan factory reserves 60 estimated seconds for this response, bounds review using remaining budget, respects due/new caps/region and resumes unfinished plans. Add explicit identity-guarded end action.
- [x] TDD: link mission start/commands/completion to the exact plan/run/version and commit final phase in the mission journal. Keep ordinary mission calls independent.
- [x] TDD: Home starts/resumes the proper phase; Study opens exact saved plan, links grades, preserves ordinary resume linkage, detaches independent browsing and offers direct applied continuation. Guard pending writes/errors with retry.
- [x] TDD: applied screen loads the exact plan, presents the existing mission player, honest unavailable/end/complete states, and verifies answer/feedback/restart/completion without SRS inflation.
- [ ] Full tests/static/content/calendar checks and fresh review; available simulator flow, precise checklist evidence, merge/push and CI.

Activity-specific active timing calibration remains a separately tracked next step; this flow package must not close B05.3-B2 until that and native acceptance pass.

## Execution record

The five implementation steps are complete. Targeted tests were observed failing before implementation, then passing (factory, linked applied storage, Study, Home/Mission and recovery paths). One fresh whole-branch review found stale ordinary resume linkage, a premature Home deck switch during a pending grade, and unlinked fallback after a failed Home plan read. All three were reproduced with failing tests and fixed; pending-grade retry and visible plan management also have regressions. No second review dispatch.

Ruling: derive one exact first-morning greeting as a distinct written response, not the full café mission — this fits the bounded activity; it remains draft content awaiting human acceptance.

Ruling: reserve an initial 60 estimated seconds for the response — active applied calibration remains B05.3-B2b2; total plan duration is still an estimate.

Ruling: explicit End clears plan intent while retaining grades/history — learners can recover from missing content without resetting learning; ending abandons the frozen plan identity.

Ruling: preserve exact linked card membership despite changed due/region metadata; block missing cards with manage/end — avoids silently changing the saved task, at the cost of requiring explicit recovery when content disappears.

Available iOS checks completed for 3/5/10 minutes, changed preferences and cold review resume, explicit end, Spanish review → answer → cold feedback resume → completion, and unchanged SRS/daily counters during the applied phase. See QA report. Final integration/CI will be recorded after actual results.
