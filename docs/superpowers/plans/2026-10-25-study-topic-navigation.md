# Study Topic Navigation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Make topic selection visible from Home and Study while preserving quick starts and an active session.

**Architecture:** Keep Study's existing landing/session state. Add a separate browser visibility state so browsing does not trigger the queue-building effect. Home sends a one-shot `topicBrowserRequest` route parameter to open the browser even with a mounted session.

**Tech Stack:** React Native, React Navigation, TypeScript, Jest, React Native Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-25-study-topic-navigation-design.md`

## Global Constraints

- Reuse the existing React Native screens, topic browser, theme, and session persistence.
- Preserve wrapping titles, accessible text sizing, and comfortably sized controls.
- Existing daily limits and daily-plan persistence continue to apply.
- Opening or switching topics respects existing grading and checkpoint guards.
- The bottom Study tab retains its existing session behavior; explicit topic actions always request the browser.

## Review Focus

- Repeated Home requests must open the browser after an earlier request was consumed.
- A browser round trip must retain queue order, region, limits, and session identity.
- A blocked grade or checkpoint must keep its recovery UI reachable.
- Browsing must pause active study timing.
- Both classic and Barrio themes and both app languages must expose the chooser.

### Task 1: Explicit topic navigation and session preservation

**Files:** `src/screens/HomeScreen.tsx`, `src/screens/StudyScreen.tsx`, `src/components/BarrioHomeContent.tsx`, `src/i18n/translations.ts`; associated Home, Study, lifecycle, and Barrio tests.

**Interfaces:** Home sends `navigate('Study', { topicBrowserRequest: sequence })`. Study consumes and clears the request. Browser visibility is independent of session mode and does not create a new session. Existing `startSession` remains the only topic-switch path.

- [x] Add failing tests for Home chooser routing in both themes, Home navigation from a session, browser round trips after grading and region selection, repeated route requests, topic switching, and blocked saves.
- [x] Run the affected Jest tests and verify the new assertions fail because the controls/behavior are missing.
- [x] Add the one-shot browser entry and guarded session controls; pause timing while browsing, expose the current topic and Continue studying, and translate the controls into Spanish.
- [x] Update existing tests to use the explicit Change topic action where they previously used Back; preserve stale-storage coverage through remount where appropriate.
- [x] Run affected Jest suites, typecheck, targeted ESLint, formatting, and diff checks; broaden to the full suite after focused checks pass.
- [x] Review the full diff for session and save regressions and record verification evidence. Commit only the scoped implementation, tests, and design/plan documents.

## Execution evidence

- Baseline: four affected suites passed, 146 tests.
- Initial regression check: seven new topic-navigation assertions failed because the controls and explicit route request did not exist.
- Final verification: `npm test -- --runInBand --watchman=false` passed all 117 suites and 1,208 tests.
- `npm run typecheck`, targeted ESLint with `--max-warnings=0`, targeted Prettier checks, and `git diff --check` passed.
- Independent code review found no Critical or Important issues. Its terminology finding was corrected, including the empty-workload primary action and browser search placeholder.
- Implementation detail: Home uses an incrementing request sequence rather than a timestamp, avoiding duplicate events and the React purity lint error.
- Recovery detail: Continue reads and compares checkpoint ownership without rewriting or rebuilding the live queue. Real-storage restore tests still prove that imported records are preserved and stale sessions require recovery.
- Native visual acceptance remains open. A fresh isolated iPhone 17 Pro simulator was created and its data-container isolation checked. The available cached Debug app failed to load the current JavaScript with `Property 'MessageQueue' doesn't exist`; it does not establish visual or interaction acceptance for these changes. The test Metro server and simulator were stopped afterward. No TestFlight build was submitted.
