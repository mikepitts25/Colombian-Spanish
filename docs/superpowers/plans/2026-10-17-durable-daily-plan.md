# Durable Daily Plan Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement serially; preserve the existing isolated host-managed worktree. Use fresh review under requesting-code-review before merge.

**Goal:** Give the forthcoming daily-plan flow an exact, recoverable, portable phase/queue contract.

**Architecture:** A strict pure schema and small storage module share the existing durable coordinator with grades and restores. Optional grade linkage advances exactly one plan card inside the existing grade journal. Portable application state includes optional plan state with backward-compatible empty defaults.

**Tech Stack:** Expo57, React Native, TypeScript, AsyncStorage, Jest.

**Spec:** `docs/superpowers/specs/2026-10-17-durable-daily-plan.md`

## Global constraints

Preserve IDs, scheduling and retained history. No new dependency or account. No draft content acceptance. Missing old plan state is empty; corrupt state is retained and surfaced. One current plan; no silent replacement of unfinished work. UI, applied completion and activity-specific timing stay explicit subsequent tasks.

## Review focus

- Caller mutates a queued start: snapshot before awaiting, preserve the original input.
- Two starts/grades race: one unfinished identity and exact first-card sequencing.
- Partial write fails: existing durable journal recovers one grade/phase without duplicate counters.
- Full-state legacy restore: reset absent plan; deck-only restore preserves it.
- Wrong/stale linkage: reject before schedule/history changes; manual practice stays independent.

## Task 1 — Validated plan storage and start

Files: create `src/storage/dailyPlanSchema.ts`, `src/storage/dailyPlans.ts`, `__tests__/storage/dailyPlans.test.ts`; modify durableStorage key allowlist.

Interfaces: `validateDailyPlanEnvelope(unknown)` asserts versioned envelope; `readDailyPlan(access?)` returns current plan or undefined; `startDailyPlan(DailyPlan)` returns copied persisted current state. Replays compare immutable definition, ignoring legitimately advanced phase/remaining membership; concurrent unfinished starts reject.

- [x] Write tests and observe failures for absent/malformed/schema/phase inputs, immutable ID conflict, replay after progress, copied queued input and competing starts.
- [x] Implement strict schema and serialized storage; pass targeted tests.

## Task 2 — Atomic review advancement

Files: modify `src/storage/flashcardAnswer.ts`; shared `advancePlanReview(tx, attempt)` in dailyPlans; test dailyPlans and flashcardAnswer.

Interface: optional `AnswerAttempt.planId`; linked nextSession must match the exact planned suffix, deck/session/region/limits. Advance within the grade transaction and reject stale inputs before persistent writes. Plan definition retains original queue IDs to distinguish an identical start replay from ID reuse after progress.

- [x] Pin exact suffix advancement, final applied/complete transition, stale identity/card/session/filter/limits, duplicate attempts, manual grades, partial-write recovery and concurrent grades with RED→GREEN.
- [x] Implement minimal transaction integration and preserve existing untimed/unlinked callers.

## Task 3 — Portable plan and merge evidence

Files: modify `src/storage/portableState.ts`; tests dailyPlans plus existing backup suites; QA report and MASTER_PLAN subpackage B05.3-B2a.

- [x] Pin parse/capture/restore roundtrip, malformed plan rejection, legacy full-state reset and deck-only preservation with RED→GREEN.
- [x] Add optional portable field and empty default, pass full tests/static/calendar/content checks, obtain fresh review, resolve findings.
- [x] Mark only contract subpackage complete. Merge/push main under standing authorization, verify CI, record actual outcomes. Continue to B05.3-B2b UI/applied integration afterward.

Verified: 84 suites / 842 tests; static/calendar/content checks and fresh review passed. Implementation `4ad3116` merged/pushed; CI39031868821 all four jobs and board deployment passed. Remaining phase UI/applied timing is tracked under B05.3-B2b.
