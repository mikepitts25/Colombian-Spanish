# Barrio-only Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved plan-first Home only for Barrio, preserving Classic and all existing learning, recovery and route behavior.

**Architecture:** Keep Home's existing IO/start controller mounted and branch only its presentation. A pure selector defines the plan card, a separate component renders Barrio content, and existing owner callbacks perform every operation. Keep production bounded Study, durable plans and unavailable editorial drafts distinct.

**Tech Stack:** Existing TypeScript/React Native/Expo57, React19, React Navigation7, theme/i18n/control components, Jest/RNTL, own-container iOS development simulators. No new product dependency.

**Spec:** [2026-10-18-barrio-home-design.md](../specs/2026-10-18-barrio-home-design.md), owner approved in this chat on 2026-10-18. [Composition references](../../design/2026-10-18-barrio-home/README.md). Owner approved this plan and Native execution in this chat on2026-10-18. Runtime steps below track actual execution.

## Global Constraints

- Classic remains default and permanently available.
- No new dependency, account, content release, recording, reward, proficiency badge, collection, storage key or schema.
- No theme-dependent screen key or conditional hooks.
- No estimate calibration or timing changes.
- No new hardcoded color palette.
- Every action has at least a 48-point target, named role and actual disabled/busy state.
- Error prose does not assert that unread storage is intact or that unrelated concurrent operations did not change device state.
- Exact new copy is the spec's `home.barrio.*` table; Classic strings remain unchanged.
- No source/alias operation, simulator cloning or direct storage writes.
- Android tooling agreements, signed production checks, hardware audio/performance, assistive-user/daylight/tap comfort and the learner/cultural/editorial gates remain open.
- Skip access-blocked security B01.8-C2g. Keep the old normal Metro and all host-owned worktrees intact.

## Review Focus

1. A foreground read fails after previously loaded data: hide stale plan/count assertions, keep independent browsing and retry the read only (Task1/3).
2. A prior-day plan or unavailable content version survives preference/day/theme changes: retain its exact identity, remaining queue and safe recovery; no replacement start (Task1/3).
3. Double press during a held/rejected start followed by theme/language/font changes: one original intent/controller, no duplicate navigation/grade, and correct retry (Task3).
4. Long Spanish tool/deck names at narrow/maximum text: full names and all lower actions remain reachable, with no nested or unnamed target (Task2/4).
5. Start crosses midnight or exhausts the production new allowance: fresh budget validation wins, no development reply is offered and no ordinary Study session is relabeled a durable plan (Task3).

## File map and shared interfaces

Create `src/utils/homePresentation.ts`, `src/components/BarrioHomeContent.tsx`, `assets/theme-icons/barrio-cup.svg`, `assets/theme-icons/barrio-cup.png` and `assets/theme-icons/barrio-cup-provenance.md`. Modify `src/screens/HomeScreen.tsx` and additive `src/i18n/translations.ts` only for product behavior. Extend existing tests and the theme audit classification only when the new source/art introduces a real classified occurrence; do not blanket exempt the component.

Task1 exports these contracts from `homePresentation.ts`:

```ts
type DailyReviewRecommendation = NonNullable<ReturnType<typeof recommendDailyReview>>;
type HomePhase = {
  kind: 'review' | 'reply';
  current: boolean;
  finished: boolean;
  unavailable: boolean;
};
type HomePresentationInput = {
  ready: boolean;
  loaded: boolean;
  readError: boolean;
  now: number;
  plan?: DailyPlan;
  response?: Pick<MissionPack, 'id' | 'contentVersion'>;
  recommendation?: DailyReviewRecommendation;
  recommendedDeck?: Pick<Deck, 'id'>;
  totalCards: number;
  totalNew: number;
  newAvailableToday: number;
  starting: boolean;
  startError: boolean;
};
type HomePresentation = {
  pending: boolean;
  startError: boolean;
  managePlanId?: string;
  phases: HomePhase[];
} & (
  | { kind: 'loading'; action: 'none' }
  | { kind: 'readError'; action: 'retryRead' }
  | { kind: 'reviewResume'; action: 'existingStart'; remainingCards: number }
  | {
      kind: 'appliedResume' | 'unavailablePlan' | 'completedToday' | 'appliedOnly';
      action: 'existingStart';
    }
  | { kind: 'recommendation'; action: 'existingStart'; suggestion: DailyReviewRecommendation }
  | { kind: 'browse'; action: 'browse'; reason: 'empty' | 'cap' | 'noDue' }
);
function deriveHomePresentation(input: HomePresentationInput): HomePresentation;
```

Use existing imports for `DailyPlan`, `MissionPack`, `Deck` and `recommendDailyReview`; export the listed types. The selector consumes validated plans, not untrusted imported JSON. No phase has contradictory current/finished/unavailable flags. All-false flags mean a planned future phase with no status suffix. Read-error/loading models have no phases or Manage-plan assertion; suppress an unrelated start-error overlay until data can be read.

Task2 exports `BarrioHomeContentProps` with `presentation: HomePresentation`, `greeting: string`, optional `activity: { dailyCount; dailyTarget; streak; freezes; totalDue; totalNew; newAvailableToday }` (all numbers), optional `word: WordOfDayPick`, `dueDecks: ReadonlyArray<{ id: string; name: string; cardCount: number; dueCount: number }>`, `reviewMeasured: boolean`, `replyMeasured: boolean`, `showDevelopment: boolean`, and these callback signatures:

- `onPrimary(): void`
- `onManagePlan(planId: string): void`
- `onBrowseStudy(): void`
- `onDeckPress(deckId: string): void`
- `onWordAudio(card: FlashCard): void`
- `onTool(route: 'Quiz' | 'DifficultWords' | 'Phrasebook' | 'Phrases' | 'Explore' | 'MissionPreview' | 'VoicePracticePreview' | 'ListeningPreview'): void`

`BarrioHomeContent(props: BarrioHomeContentProps)` uses the existing language/theme hooks to translate/repaint; it imports no storage, deck provider, config gate or navigator. The owner passes `activity` only after loaded/no-error; it supplies full display names and existing calculated values. `reviewMeasured`/`replyMeasured` are true only when the current applicable estimate is calibrated. No final-copy strings live in the selector.

## Task 1: Pure plan-card contract and exact copy

**Files:** Create `src/utils/homePresentation.ts`, `__tests__/utils/homePresentation.test.ts`; modify `src/i18n/translations.ts` additively. Verify added key parity in the new selector test by importing `translate`; no separate i18n test file exists and no empty translation harness is needed.

**Interfaces:** Consumes existing validated plan/recommendation/mission types. Produces the selector/types above and exact spec keys used by Task2; no runtime IO or rendering.

- [x] **Step 1:** Write `deriveHomePresentation` table tests covering all nine kinds and spec priorities. Use a real valid plan fixture: review initial IDs `['a','b','c']`, remaining `['b','c']`, valid exact queue/session/limits; assert reviewResume.remainingCards is2 even when the recommendation has9. Prior-day unfinished wins; same-day complete wins; previous-day complete falls through. Mismatched/absent response yields unavailablePlan; applied-only has no finished review row. Failed foreground read after a stored plan yields readError with no phases/manage ID. Empty/cap/noDue are distinct, and no recommendation with a missing/mismatched deck is displayed as a startable review.
- [x] **Step 2:** Run `npm test -- --runInBand --runTestsByPath __tests__/utils/homePresentation.test.ts`. Expected RED: missing selector/export, not a broken runner. Capture the result in the eventual QA software log.
- [x] **Step 3:** Implement the pure function with the spec's ordered table and `localDayKey(new Date(input.now))`. For upcoming stored reply compare both ID and contentVersion. Fresh recommendation deck must match its ID; new allowance and total cards determine browse reason only after earlier states fail. Pending/error overlays cannot invent a plan or action. Add every exact `home.barrio.*` table key in both languages, preserving existing keys. Add key parity and representative singular/plural/unavailable/error interpolation assertions to the selector test.
- [x] **Step 4:** Rerun Step2 and `npm run typecheck`. Expected GREEN; use an injected `now` on a different local day from the host clock and frozen input objects to prove the result follows input time without mutation. Inspect the selector imports to confirm it does not depend on IO/navigation. Do not replace these tests with snapshots.
- [x] **Step 5:** Commit `feat: define Barrio Home presentation states and copy`.

## Task 2: Barrio content, original art and accessible controls

**Files:** Create `src/components/BarrioHomeContent.tsx`, `__tests__/components/BarrioHomeContent.test.tsx` and the three cup assets/provenance paths above. Use existing `ThemeIcon`, `ThemedPressable`, `controlStates`, `ThemeContext`, `LanguageContext`, `WordOfDayPick` and `FlashCard` exports.

**Interfaces:** Consumes Task1 model/keys. Produces the typed component/callback props above. No controller, IO, feature gating or route ownership moves into this component.

- [x] **Step 1:** Write component tests for one primary CTA in each kind; exact state/copy, pending disabled/busy, read/start alert distinction, conditional new-card/catch-up text, singular/plural activity/streak/freezes, retained queue count without invented remaining time, full long Spanish deck name, no fictional applied phase and no stale activity section. Fire every tool, Browse, Manage, deck and word-audio action and assert exact callback arguments. Development tools exist only when supplied enabled. Assert one named Listen+phrase control and no accessible decorative cup.
- [x] **Step 2:** Run `npm test -- --runInBand --runTestsByPath __tests__/components/BarrioHomeContent.test.tsx`. Expected RED for missing component/behavior.
- [x] **Step 3:** Implement `BarrioHomeContent(props: BarrioHomeContentProps)` in the spec's section order, with multiline content and min48 targets. Two-column tools only when fontScale<1.4 and available content width≥360 points; otherwise stack. Grow all text containers; no ellipsis on deck names, fixed text height or absolute footer. Native measurement keys may depend on fontScale only below the owner. Use semantic roles/state helpers for pressed/disabled/focus and progressbar current/max. Render the original cup as a128×128 transparent asset at40×40 points with existing accent tint; hide at fontScale≥1.4 or content width<320. Store vector and provenance; no dependency/install. All-false future phase flags show the phase label alone, current/finished/unavailable append the spec status text. Keep unknown activity omitted and raw daily count uncapped in prose.
- [x] **Step 4:** Rerun Step2 plus `npm run typecheck` and `node scripts/audit-theme-colors.js`. Expected GREEN with no unclassified new occurrence; record any existing Classic exceptions without changing them. Verify cup PNG dimensions/transparency and reproducible regeneration with the external renderer; no runtime board raster.
- [x] **Step 5:** Commit `feat: build accessible Barrio Home composition`.

## Task 3: Stable Home integration and real-provider retention

**Files:** Modify `src/screens/HomeScreen.tsx`, `__tests__/screens/HomeScreen.test.tsx`, `__tests__/screens/HomeWorkload.integration.test.tsx`, and targeted unavailable-plan tests in `__tests__/screens/DailyPlanLifecycle.test.tsx`.

**Interfaces:** Consumes Task1 selector and Task2 component. Retains existing Home IO/start callbacks and all storage/provider APIs. Produces optional Barrio rendering with the Classic JSX/styles and current fallback semantics intact.

- [x] **Step 1:** Add controller tests that render Home under real ThemeProvider, hold/reject the existing fresh start/read operation, double press, then switch identity/appearance, language and live font size. Assert same Home controller, one start intent/navigation, disabled primary/Manage/deck-start, stable semantic pending card and correct operation-specific retry. Use valid stored plans and actual queues, not the old partial mocked Home plan shape. Read failure after prior success hides stale counts/model without starting practice. After success, one navigation uses the exact returned ID/limits, not the older rendered recommendation.
- [x] **Step 2:** Extend the real DeckProvider Home/Study harness with production (`SHOW_REVIEW_TOOLS=false`) and draft fixtures, fresh budget across midnight/preferences/cap, retained prior-day exact plan, completed day transition and unavailable content version. Assert production uses existing bounded Study params and creates no new durable-plan/mission entry. For retained plans assert exact plan/session/queue IDs; a content mismatch routes to safe DailyPlan recovery with original identity. Count learning events, schedules, daily/new counters and grade writes before/after ungraded switches; unchanged except documented ordinary session initialization. Extend DailyPlanLifecycle's storage-based fixture only for unavailable End/Home behavior; do not call its mocked deck hook a real provider.
- [x] **Step 3:** Run `npm test -- --runInBand --runTestsByPath __tests__/screens/HomeScreen.test.tsx __tests__/screens/HomeWorkload.integration.test.tsx __tests__/screens/DailyPlanLifecycle.test.tsx`. Expected RED for absent Barrio composition/state behavior. Preserve existing Classic tests and distinguish any pre-existing failure before product edits.
- [x] **Step 4:** Integrate below all existing Home hooks/controller state. Derive totalCards from decks and pass exact data/callbacks; branch only the JSX. Adapt primary action to read retry, browse or the existing `activity.plan || response ? startPlan() : startStudy(recommendedDeck?.id, true)` route, with an early return for none/pending **or starting.current** before snapshotting or calling a handler; a second press must not attach cleanup to a no-op handler and clear the first pending snapshot. Keep original handlers' fresh reads and ref guards. A Barrio-only local React state snapshot (execution ruling: installed React19 lint forbids refs during render) retains the untranslated semantic model when an existingStart begins; while existing studyStarting is true, render that snapshot with pending=true/startError=false, then discard it when the operation settles. This is transient display data, not a second saved intent. Guard Manage/deck starts via existing starting ref; use the existing callbacks for Classic unchanged. Pass development gate and suppress stale activity explicitly. Do not move lifecycle hooks into either presentation or add a new refresh timer.
- [x] **Step 5:** Rerun Step3, Task1/2 tests and `npm run typecheck`. Expected GREEN. Inspect the Classic source/render delta: same flag/greeting/avatar/tools/audio/deck callbacks and no changed legacy strings or storage algorithms. Commit `feat: integrate Barrio Home without replacing learning controllers`.

## Task 4: Complete verification, own-device acceptance, review and integration

**Files:** Create `docs/qa/2026-10-18-barrio-home/README.md`, software logs, native preflights/screenshots/state evidence and a passive verifier if needed to check recorded hashes. Update MASTER_PLAN B08.3 with exact completed scope and retained gaps. Product fixes return to the owning task's failing regression.

**Interfaces:** Consumes Tasks1–3 runtime. Produces bounded observed iOS evidence, independent review, CI and merged/pushed state; does not authorize editorial release or claim signed/hardware acceptance.

- [x] **Step 1:** Run full `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:calendar`, `npm run validate:data`, `npm run content:validate-reviews`, `npm run content:review`, `node scripts/audit-theme-colors.js` and `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts/tests -p test_simulator_isolation.py`. Expected every command exit0; record counts, Classic contrast exceptions and still-open editorial gates. Verify no manifest/review-inventory drift.
- [x] **Step 2:** Check actual generated config and installed development binary provenance. Reuse the foundation iOS binary only if Tasks1–3 made no native configuration/dependency change; new JS/image assets are Metro-delivered. If a native rebuild is required, follow the already approved theme foundation Task6 Debug/simulator build command with CODE_SIGNING_ALLOWED=NO, recording actual workspace/scheme. Preserve normal8098 Metro; serve current worktree using its real cloned dependencies on a free port, clear CI-mode Metro when JS changes, and verify the actual source root before UI acceptance.
- [ ] **Step 3:** Preflight candidate narrow phone `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730` and actual mini `DF3686C1-A2E7-4870-B127-A83A8B67541D` with `PYTHONDONTWRITEBYTECODE=1 python3 scripts/simulator_isolation.py EXPLICIT-UUID` before and after every launch. Verify current model/container rather than trusting these carried-forward names; if a candidate fails or no longer exists, independently create/install a new named QA device and record its explicit UUID (never clone/operate an alias). Preserve baselines/backups and model identity. Through CUA and supported import only, verify both languages × BarrioLight/Dark at default/live maximum text: current primary, all lower sections by actual touch scroll, long names, tool/Explore/Favorites/deck/settings/goal routes, word-audio entry, completed/exact review/development greeting states and cold preservation. Do not grade repeatedly merely for screenshots; use reversible fixtures. Record initialized-fixture versus original-state restoration honestly and all eleven durable hashes/event counts. Record keyboard/AX/attachment limits instead of calling them app defects or passing touch checks.
- [ ] **Step 4:** Validate production review-only, unavailable linked content, empty/cap and start/read failures with appropriate build or explicitly labeled isolated fixture/harness; they are not signed-production acceptance. Roundtrip to Classic and cold restart with original preference/queue/learning state restored. Exercise retained plan across changed day/preferences; verify one returned exact identity. If a required native case is tool-blocked, keep that acceptance unchecked and continue independent executable work; do not silently waive it.
- [x] **Step 5:** Run evidence verifier/scope checks after capture and appropriate focused/full checks after any product fix. Obtain one fresh read-only whole-branch review against this plan and approved spec; address all Critical/Important findings with regressions. Update checklist only for proven delivered scope. Commit verified QA/checklist, push, wait all candidate CI jobs, merge exact reviewed HEAD under standing authorization, synchronize main without overwriting user files and verify merged CI/local-remote SHA. Preserve host-owned worktrees. Commit message `docs: verify Barrio Home and record remaining acceptance`.

## Plan self-review and execution handoff

Spec coverage: state/copy/count/estimate/availability→Task1; original art/layout/routes/semantics→Task2; Classic/controller/error/fresh-start/storage invariants→Task3; complete automated/native/review/integration→Task4. All five Review Focus cases have explicit tests in their owning tasks and native checks where needed. Shared names and props are defined once above; no new storage subsystem or content acceptance is hidden in the tasks.

Recommend **Native** execution: these four tasks share the presentation contract and existing Home controller, so inline work avoids handoff churn; one independent whole-branch review remains required. Preserve the owner's standing Native execution preference. Owner review approved this later Home plan and Native execution; the completed foundation was not treated as its approval.

Owner review approved this implementation plan and Native execution on2026-10-18. Task checkboxes record performed work and verification; unfinished tasks remain open.

Task4 software/review/integration completed in PR19 with all4 candidate and merged-main checks green; Steps3/4 remain open only for explicitly recorded native acceptance gaps. See docs/qa/2026-10-18-barrio-home/README.md and MASTER_PLAN B08.3-C3. This does not mark the entire Home/native plan complete.
