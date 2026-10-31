# Café Adventures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver two connected café visits, optional warm-ups and a durable practice passport.

**Architecture:** Reuse the pure mission engine and scene UI through an injected storage adapter. A mode-scoped adventure store owns runs, evidence, milestones and stamps, using the existing transaction coordinator and portable backups. An exact content registry gates accepted content independently of development previews.

**Tech Stack:** Expo, React Native, TypeScript, AsyncStorage, React Navigation, Jest.

**Spec:** `docs/superpowers/specs/2026-10-31-cafe-adventures-design.md` (owner approved October 31).

## Global Constraints

- Keep Classic default, both themes functional, existing daily-plan priority and source-card IDs intact.
- No draft-to-accepted promotion, inferred historical awards, raw answer storage or public release.
- Adventures remain free; no billing, reminder, streak or SRS scheduling changes.
- 50 current runs, 50 milestones, 200 outcomes maximum; fail without pruning earned history.
- Restore app state replaces its snapshot; older backups clear absent adventure state.
- Scenes and copy remain editorial drafts until genuine human acceptance.

## Review Focus

- Draft and accepted runs sharing a mission ID must never replace each other (Task 2).
- A correct retry qualifies a node, skipping failure does not; accent correction requires retry (Tasks 1–2).
- Content changing between display and press/background return must block stale commands (Tasks 2–3).
- An uncertain commit retry cannot duplicate events, milestones or stamps (Task 2).
- Older or malformed backup import must not partially replace progress (Task 2).

## Task 1: Content identity and authored encounters

**Files:** Create `src/adventures/content.ts`, `identity.ts`, `acceptance.json`, `__tests__/adventures/content.test.ts`.

**Interfaces:** `AdventureDefinition { pack, requiredNodeIds, warmupCardIds }`; `resolveAdventure(id, decks, mode): ResolvedAdventure | undefined`; `canonicalJson(value): string`; `sha256(text): string`. Resolved identity binds pack, required nodes, warm-up references and source-card teaching fingerprints. Mode is `preview | accepted`.

- [ ] Write tests asserting known SHA-256 vectors, key-order stability, scheduling independence, changed teaching text/pack/required nodes invalidates acceptance, empty/withdrawn manifest denies accepted mode, both scripts validate against real decks.
- [ ] Run `npx jest __tests__/adventures/content.test.ts --runInBand --watchman=false`; expect missing-module failure before implementation.
- [ ] Implement deterministic hashing without a new native dependency, draft version-2 first café pack and version-1 return visit; retain legacy `FIRST_MORNING` for current previews/daily response. Acceptance manifest starts empty.
- [ ] Re-run content tests; expect all pass. Commit content and tests.

## Task 2: Durable evidence, outcomes and backup

**Files:** Create `src/adventures/state.ts`, `src/storage/adventures.ts`, `__tests__/adventures/storage.test.ts`; modify `src/storage/durableStorage.ts`, `portableState.ts`, `src/i18n/translations.ts`.

**Interfaces:** `readAdventures(access?): Promise<AdventureState>`; `createAdventureAdapter(id, mode, getDecks)` supplies `load`, `start`, `apply`, `warmup`; store functions re-resolve eligibility inside every operation. `AdventureState` holds `runs`, `milestones`, `outcomes`; `validateAdventureState` is strict and import-safe. Each adventure run wraps a validated `MissionRun` plus identity, mode, warm-up and per-node correct statuses.

- [ ] Write real-storage tests for supported/unsupported completions, retry/skip/accent behavior, mode isolation, preserved legacy state, once-only retry after injected write failure, no downgrade, stable unlock, version invalidation, bounds, legacy backup reset and rejected duplicates.
- [ ] Run storage tests; expect missing feature failures.
- [ ] Implement mode-scoped adapter using the pure engine and durable coordinator; atomically persist attempt events, run evidence, milestones and outcomes. Store evidence alongside the run rather than modifying the general-purpose engine schema. Register optional portable backup state and explicit restore warning.
- [ ] Run adventure tests plus `__tests__/storage/portableBackup.test.ts`, mission engine/storage tests; expect pass. Commit durable feature and tests.

## Task 3: Scenes, warm-up, passport and navigation

**Files:** Modify `src/screens/MissionScreen.tsx`, `HomeScreen.tsx`, `ProgressScreen.tsx`, `src/components/BarrioHomeContent.tsx`, `src/navigation/index.tsx`, `src/i18n/translations.ts`; create `src/screens/AdventuresScreen.tsx`, `AdventureScreen.tsx`, `src/components/AdventureEntry.tsx`, `PracticePassport.tsx`, `__tests__/screens/AdventuresScreen.test.tsx`.

**Interfaces:** Optional `MissionScreen` adapter/availability/heading/notice/run-action/result slots preserve existing defaults. `AdventureEntry` and `PracticePassport` read fresh focused state with scoped retry and use registry eligibility; `AdventureScreen` owns warm-up state and scene adapter; navigation parameters carry episode ID/mode only and are revalidated.

- [ ] Add failing UI tests for complete visit → stamp → next visit, optional warm-up persistence, unavailable production content, both themes and daily-plan entry priority.
- [ ] Run new tests; expect absent UI failures.
- [ ] Implement the scenes using existing controls, keyboard behavior, bilingual copy and static stamps; add focus/foreground eligibility checks and exact-save retries. Add optional Home entry after primary activity and passport in Progress.
- [ ] Run scene/Home/Progress/Barrio and adventure tests; expect pass. Commit UI feature and tests.

## Task 4: Verification, editorial/pilot package and review

**Files:** Create `docs/qa/2026-10-31-cafe-adventures/REPORT.md`, `docs/pilot/CAFE_ADVENTURES.md`; update design status and plan checkboxes.

- [ ] Run full Jest suite, typecheck, lint, format checks and content validation; fix confirmed regressions with tests.
- [ ] Follow `docs/qa/SIMULATOR_PREFLIGHT.md`, build dedicated iOS simulator candidate and exercise the available UI controls. Record actual coverage and limitations, including any unavailable controls.
- [ ] Prepare two-episode editorial checklist and local pilot worksheet (comprehension, help comfort, voluntary return, delayed recall), with no fabricated acceptance or participant results.
- [ ] Obtain a fresh whole-branch code review, address material findings, re-run relevant checks and commit evidence.

## Execution record

Native implementation in this session follows the owner's approval to implement; no further product choice is needed. Native managed-worktree calls rejected available arguments, so an ignored `.worktrees/cafe-adventures` Git worktree on `codex/cafe-adventures` provides isolation. Runtime publication and genuine editorial acceptance remain separate.
