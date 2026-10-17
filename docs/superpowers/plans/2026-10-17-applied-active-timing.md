# Applied active timing implementation plan

> **For agentic workers:** Use superpowers:executing-plans serially in the existing isolated worktree; one fresh whole-branch review before merge.

**Goal:** Calibrate the written activity from completed, active measured runs.

**Architecture:** Optional per-run accumulator and bounded mission-envelope samples; shared pure estimate feeds Home and atomic factory. Reuse foreground/focus hook and immutable command retries.

**Tech Stack:** Existing React Native/TypeScript/Jest/Expo57; no new dependency.

**Spec:** `docs/superpowers/specs/2026-10-17-applied-active-timing.md`

## Constraints / review focus

Draft gate unchanged. No SRS, daily-count or learning-event inflation. Old/unknown timing never becomes a calibrated sample. Preserve exact plans and command identity. Journal final sample with mission/plan; retain portable compatibility. Check missing segments after restart, hint and save pauses, stale command replay, malformed backup timing and unrelated run replacement.

## Tasks

- [x] RED/GREEN timing schema, eligible shape, median/filter/threshold/clamps; engine accumulation, null propagation and replay identity. Commit.
- [x] RED/GREEN atomic sample completion/recovery/retention/portable backup; preview and fresh factory share estimate and preserve saved plans. Commit.
- [x] RED/GREEN actual MissionScreen timing lifecycle, hints/retries/save failure and cold resume; localize honest measured activity note. Commit.
- [x] Full checks, one fresh branch review/fixes, available native evidence; update master checklist, merge/push and verify CI.

## Execution record

Engine/calibration tests: observed RED missing timing module, then GREEN 16 tests with existing engine. Storage tests: RED missing completion samples and unchanged fresh allowance, then GREEN. Additional RED nonfinite active input exposed JSON snapshot converting NaN to null; retain the primitive through snapshot so transition validation rejects it, then GREEN. UI tests: RED missing active segments/cold-feedback sample and two-card Home preview; GREEN after implementation and correcting the expected translated deck label to Greetings. Full suite 89/872, type/lint/format/calendar/data/editorial checks pass before review. No new dependencies or permission gates.

Ruling: the calibration measures actionable response time and excludes feedback reading — this matches the written-response workload; the estimate may be conservative if the learner spends longer reading feedback. Existing wall-clock answer-event duration is retained as a separate legacy observation, never used for calibration.

Ruling: keep at most100 samples in the existing portable mission envelope — avoids an extra storage/backup subsystem; calibration uses only the latest30 matching samples in 30 days.

Fresh whole-branch review of c2883cc..9f87d46 found no blocking regressions. Actual fresh iOS27 fixture completed two review grades, measured a hint plus written reply with background exclusion, cold-resumed feedback and committed one sample with plan completion. Sample45,228ms; hint→answer wall 89,937ms vs active 39,422ms; confirmed background 32.75sec. Daily 2/5, three events and deck hash unchanged by completion. Full report records limits. Merged/pushed implementation 9f87d46 plus evidence 0cd546a. Merged full 89/872 and format passed. CI 39035133880 all four jobs and board 39035133892 passed. All four bounded package tasks complete; broader layout/lifecycle acceptance remains explicitly open.
